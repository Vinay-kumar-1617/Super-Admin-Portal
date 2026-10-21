// State-scoped seed data for the Telangana Operations Manager dashboard.
// Sits between Zone/City admins and Super Admin: read access across
// operations plus booking.manage and dispatch.override. Escalations flow
// up to city admins or the state admin (Anitha Rao).
import { emailForRole } from '../../auth/roleAccounts'

// Seed dates are relative to today so the date pickers on the operations
// pages can retrieve a realistic spread of records.
export const daysAgoIso = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export type SectionId =
  | 'overview'
  | 'dispatch'
  | 'bookings'
  | 'vehicles'
  | 'map'
  | 'shift'
  | 'escalations'
  | 'sla'
  | 'approvals'
  | 'disputes'
  | 'issues'
  | 'reports'
  | 'audit'
  | 'rules'
  | 'notifications'

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type OpsKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export type SupplyRow = {
  id: string
  city: string
  zone: string
  supply: number
  demand: number
  operatorsOnShift: number
  response: number
  balance: 'Balanced' | 'Short' | 'Surplus'
}

export type ShiftSnapshot = {
  open: number
  inProgress: number
  atRisk: number
}

export type OpsAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: 'Critical' | 'Warning' | 'Info'
  target: SectionId
}

export type JobStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Stuck' | 'At Risk'

export type DispatchJob = {
  requestedOn: string
  id: string
  bookingId: string
  customer: string
  city: string
  zone: string
  machine: string
  priority: 'Urgent' | 'Normal'
  status: JobStatus
  requested: string
  sla: number
  operator?: string
}

export type AvailableOperator = {
  id: string
  name: string
  zone: string
  city: string
}

export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  target: string
  reason: string
}

export type BookingHistoryEntry = {
  time: string
  event: string
}

export type BookingStatus = 'Confirmed' | 'Active' | 'Completed' | 'Cancelled'

export type OpsBooking = {
  bookedOn: string
  id: string
  customer: string
  city: string
  zone: string
  machine: string
  amount: string
  status: BookingStatus
  window: string
  operator: string
  stuck: boolean
  history: BookingHistoryEntry[]
}

export type VehicleStatus = 'On Hire' | 'Available' | 'Maintenance' | 'Inspection'

export type Vehicle = {
  lastPingOn: string
  id: string
  model: string
  regNo: string
  type: string
  city: string
  zone: string
  driver: string
  status: VehicleStatus
  ping: string
  map: { x: number; y: number }
}

export type CityMarker = {
  city: string
  x: number
  y: number
  vehicles: number
  demand: number
}

export type ShiftStatus = 'On shift' | 'On break' | 'Ending soon'

export type ShiftMember = {
  id: string
  name: string
  role: 'Dispatcher' | 'Support Lead' | 'Support Agent'
  shift: 'Morning' | 'Evening' | 'Night'
  area: string
  status: ShiftStatus
}

export type HandoverNote = {
  date: string
  id: string
  time: string
  author: string
  text: string
}

export type ShiftLogEntry = {
  date: string
  id: string
  time: string
  type: 'Incident' | 'Action' | 'Note'
  author: string
  text: string
}

export type EscalationStatus = 'New' | 'Acknowledged' | 'Escalated'

export type Escalation = {
  receivedOn: string
  id: string
  from: string
  role: 'Dispatcher' | 'Zone manager'
  city: string
  subject: string
  detail: string
  received: string
  severity: 'Critical' | 'Warning' | 'Info'
  status: EscalationStatus
  escalatedTo?: string
}

export type DisputeKind = 'Dispute' | 'Ticket'
export type DisputePriority = 'Critical' | 'High' | 'Medium' | 'Low'
export type DisputeStatus = 'Open' | 'Under Review' | 'Resolved'

export type DisputeTimelineEntry = {
  time: string
  event: string
}

export type Dispute = {
  id: string
  kind: DisputeKind
  bookingId: string
  raisedBy: string
  against: string
  category: string
  amount?: string
  status: DisputeStatus
  opened: string
  priority: DisputePriority
  summary: string
  machine: string
  locality: string
  /** Days the case has been open. */
  daysOpen: number
  /** Days the case is allowed to stay open before it breaches. */
  targetDays: number
  /** Who holds the decision on the case. */
  owner: string
  lastUpdate: string
  evidenceCount: number
  nextStep: string
  timeline: DisputeTimelineEntry[]
}

export type ResponseRow = {
  city: string
  minutes: number | null
  trend: string
}

export type UnassignedRow = {
  zone: string
  minutes: number
}

export type OverridePoint = {
  month: string
  overrides: number
}

export type CancellationRow = {
  reason: string
  count: number
  pct: number
}

export type OpsNotificationCategory =
  | 'Booking'
  | 'Vehicle'
  | 'Pickup'
  | 'Return'
  | 'Delivery'
  | 'Maintenance'
  | 'Incident'
  | 'Deadline'
  | 'Escalation'
  | 'Shift'

export type OpsNotificationPriority = 'Critical' | 'High' | 'Normal' | 'Low'

export type OpsNotification = {
  id: string
  category: OpsNotificationCategory
  title: string
  detail: string
  time: string
  tone: 'green' | 'amber' | 'red' | 'blue'
  priority: OpsNotificationPriority
  read: boolean
  target: string
  zone: string
  city: string
  relatedId?: string
}

export type NotificationPreference = {
  category: OpsNotificationCategory
  enabled: boolean
  priority: OpsNotificationPriority
}

export const opsProfile = {
  state: 'Telangana',
  city: 'Hyderabad',
  zone: 'Madhapur',
  adminName: 'Vikram Shah',
  adminEmail: emailForRole('operations-manager'),
  adminInitials: 'VS',
}

export const permissions: Array<{ scope: string; detail: string }> = [
  { scope: 'Read', detail: 'Zone vehicles · drivers · bookings · disputes · reports · live map' },
  { scope: 'Write', detail: 'booking.manage · dispatch.override (reason + audit required)' },
  { scope: 'Escalate', detail: 'Zone manager / dispatcher inbox → city admin or state admin' },
]

export const opsKpis: OpsKpi[] = [
  {
    label: 'Active jobs',
    value: '396',
    change: '+8.2%',
    tone: 'green',
    description: 'Jobs in progress across the zone right now.',
    target: 'dispatch',
  },
  {
    label: 'Unassigned jobs',
    value: '37',
    change: '+12',
    tone: 'orange',
    description: 'Open and waiting for an operator — 18 over 30 minutes.',
    target: 'dispatch',
  },
  {
    label: 'Avg response time',
    value: '34 min',
    change: '-3 min',
    tone: 'purple',
    description: 'Zone request-to-dispatch average this month.',
    target: 'reports',
  },
  {
    label: 'Cancellations',
    value: '64',
    change: '+9.3%',
    tone: 'blue',
    description: 'Cancelled bookings this month — 2.5% rate.',
    target: 'bookings',
  },
]

export const shiftSnapshot: ShiftSnapshot = { open: 63, inProgress: 396, atRisk: 14 }

// Supply (machines ready now) vs demand (open jobs) per zone — mirrors the
// State Admin zone list for Telangana.
export const supplyRows: SupplyRow[] = [
  { id: 'zn-hyd-1', city: 'Hyderabad', zone: 'Madhapur', supply: 12, demand: 16, operatorsOnShift: 24, response: 28, balance: 'Short' },
  { id: 'zn-hyd-2', city: 'Hyderabad', zone: 'Gachibowli', supply: 15, demand: 14, operatorsOnShift: 22, response: 29, balance: 'Balanced' },
  { id: 'zn-hyd-3', city: 'Hyderabad', zone: 'Kukatpally', supply: 13, demand: 12, operatorsOnShift: 19, response: 31, balance: 'Balanced' },
  { id: 'zn-hyd-4', city: 'Hyderabad', zone: 'Uppal', supply: 11, demand: 9, operatorsOnShift: 16, response: 33, balance: 'Balanced' },
  { id: 'zn-hyd-5', city: 'Hyderabad', zone: 'Begumpet', supply: 9, demand: 7, operatorsOnShift: 13, response: 34, balance: 'Balanced' },
  { id: 'zn-hyd-6', city: 'Hyderabad', zone: 'LB Nagar', supply: 8, demand: 5, operatorsOnShift: 12, response: 36, balance: 'Surplus' },
  { id: 'zn-wgl-1', city: 'Warangal', zone: 'Hanamkonda', supply: 7, demand: 7, operatorsOnShift: 11, response: 36, balance: 'Balanced' },
  { id: 'zn-wgl-2', city: 'Warangal', zone: 'Kazipet', supply: 6, demand: 5, operatorsOnShift: 9, response: 38, balance: 'Balanced' },
  { id: 'zn-krm-1', city: 'Karimnagar', zone: 'Chowrasta', supply: 6, demand: 8, operatorsOnShift: 10, response: 39, balance: 'Short' },
  { id: 'zn-nzb-1', city: 'Nizamabad', zone: 'Bodhan Road', supply: 5, demand: 6, operatorsOnShift: 8, response: 42, balance: 'Short' },
  { id: 'zn-khm-1', city: 'Khammam', zone: 'Wyra Road', supply: 5, demand: 5, operatorsOnShift: 8, response: 40, balance: 'Balanced' },
  { id: 'zn-rmd-1', city: 'Ramagundam', zone: 'Godavarikhani', supply: 4, demand: 4, operatorsOnShift: 7, response: 44, balance: 'Balanced' },
  { id: 'zn-srt-1', city: 'Suryapet', zone: 'Alair Road', supply: 4, demand: 3, operatorsOnShift: 6, response: 45, balance: 'Surplus' },
  { id: 'zn-nlg-1', city: 'Nalgonda', zone: 'Miryalaguda Road', supply: 3, demand: 3, operatorsOnShift: 5, response: 47, balance: 'Balanced' },
]

export const opsAlerts: OpsAlert[] = [
  {
    id: 'oa-1',
    title: '18 jobs unassigned past 30 minutes',
    detail: 'Hyderabad queue is breaching dispatch SLA on crane and excavator requests.',
    time: '12 min ago',
    severity: 'Critical',
    target: 'dispatch',
  },
  {
    id: 'oa-2',
    title: 'Crew shortage in Karimnagar and Nizamabad',
    detail: 'Chowrasta and Bodhan Road show demand above ready supply for the evening shift.',
    time: '40 min ago',
    severity: 'Warning',
    target: 'overview',
  },
  {
    id: 'oa-3',
    title: 'Dispatch delays above SLA',
    detail: 'Nalgonda (47 min) and Suryapet (45 min) exceed the 40-minute statewide target.',
    time: '1 hour ago',
    severity: 'Warning',
    target: 'reports',
  },
  {
    id: 'oa-4',
    title: 'Cancellations rising in Nizamabad',
    detail: 'Cancellation rate up 40% week over week, mostly machine-unavailable reasons.',
    time: '3 hours ago',
    severity: 'Info',
    target: 'bookings',
  },
]

export const dispatchJobs: DispatchJob[] = [
  { id: 'JOB-7801', requestedOn: daysAgoIso(0), bookingId: 'BK-5190', customer: 'HCC Constructions', city: 'Hyderabad', zone: 'Madhapur', machine: 'Tower Crane 6T', priority: 'Urgent', status: 'Unassigned', requested: '10:05', sla: 30 },
  { id: 'JOB-7807', requestedOn: daysAgoIso(0), bookingId: 'BK-5192', customer: 'Kences Builders', city: 'Karimnagar', zone: 'Chowrasta', machine: 'Concrete Mixer', priority: 'Urgent', status: 'Unassigned', requested: '10:18', sla: 30 },
  { id: 'JOB-7805', requestedOn: daysAgoIso(0), bookingId: 'BK-5191', customer: 'Vascon Engineers', city: 'Warangal', zone: 'Hanamkonda', machine: 'Backhoe Loader', priority: 'Normal', status: 'Unassigned', requested: '10:26', sla: 45 },
  { id: 'JOB-7809', requestedOn: daysAgoIso(0), bookingId: 'BK-5193', customer: 'Deccan Roadlines', city: 'Nizamabad', zone: 'Bodhan Road', machine: 'Tipper 10 Wheeler', priority: 'Normal', status: 'Unassigned', requested: '10:41', sla: 45 },
  { id: 'JOB-7802', requestedOn: daysAgoIso(0), bookingId: 'BK-5189', customer: 'MEIL', city: 'Hyderabad', zone: 'Gachibowli', machine: 'Excavator', priority: 'Normal', status: 'Assigned', requested: '09:52', sla: 30, operator: 'Sandeep Yadav' },
  { id: 'JOB-7793', requestedOn: daysAgoIso(1), bookingId: 'BK-5171', customer: 'Sobha Realty', city: 'Hyderabad', zone: 'Gachibowli', machine: 'Tower Crane 6T', priority: 'Normal', status: 'At Risk', requested: '09:31', sla: 30, operator: 'Ayesha Siddiqui' },
  { id: 'JOB-7795', requestedOn: daysAgoIso(1), bookingId: 'BK-5182', customer: 'L&T Metro Rail', city: 'Hyderabad', zone: 'Madhapur', machine: 'CAT 320 Excavator', priority: 'Normal', status: 'In Progress', requested: '09:12', sla: 30, operator: 'Kiran Vardhan' },
  { id: 'JOB-7798', requestedOn: daysAgoIso(1), bookingId: 'BK-5176', customer: 'My Home Builders', city: 'Hyderabad', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', priority: 'Normal', status: 'In Progress', requested: '09:44', sla: 45, operator: 'Rakesh Naidu' },
  { id: 'JOB-7788', requestedOn: daysAgoIso(2), bookingId: 'BK-5168', customer: 'TSIIC', city: 'Hyderabad', zone: 'Begumpet', machine: 'Motor Grader MG-180', priority: 'Normal', status: 'In Progress', requested: '08:58', sla: 45, operator: 'Venkat Rao' },
  { id: 'JOB-7790', requestedOn: daysAgoIso(2), bookingId: 'BK-5173', customer: 'Ramky Infrastructure', city: 'Hyderabad', zone: 'Uppal', machine: 'Volvo FMX Tipper', priority: 'Urgent', status: 'Stuck', requested: '09:05', sla: 30, operator: 'Imran Ali' },
]

export const availableOperators: AvailableOperator[] = [
  { id: 'OP-102', name: 'Sandeep Yadav', zone: 'Gachibowli', city: 'Hyderabad' },
  { id: 'OP-103', name: 'Rakesh Naidu', zone: 'Kukatpally', city: 'Hyderabad' },
  { id: 'OP-105', name: 'Imran Ali', zone: 'Uppal', city: 'Hyderabad' },
  { id: 'OP-106', name: 'Venkat Rao', zone: 'Begumpet', city: 'Hyderabad' },
  { id: 'OP-107', name: 'Ayesha Siddiqui', zone: 'Gachibowli', city: 'Hyderabad' },
  { id: 'OP-108', name: 'Mahesh Goud', zone: 'LB Nagar', city: 'Hyderabad' },
  { id: 'OP-121', name: 'Ravi Teja', zone: 'Madhapur', city: 'Hyderabad' },
  { id: 'OP-131', name: 'Srinivas Goud', zone: 'Hanamkonda', city: 'Warangal' },
  { id: 'OP-132', name: 'Padma Rani', zone: 'Chowrasta', city: 'Karimnagar' },
]

export const auditTrail: AuditEntry[] = [
  { id: 'AU-104', time: '09:58', actor: 'Vikram Shah', action: 'Manual dispatch override', target: 'JOB-7802 → Sandeep Yadav', reason: 'Customer requested an excavator with trenching attachment.' },
  { id: 'AU-103', time: '09:34', actor: 'Vikram Shah', action: 'Prioritized job', target: 'JOB-7801 Urgent', reason: 'Metro rail site outage — crane needed before noon.' },
  { id: 'AU-102', time: '08:47', actor: 'Vikram Shah', action: 'Reassigned in-progress job', target: 'JOB-7798 → Rakesh Naidu', reason: 'Original operator dropped out — vehicle breakdown.' },
  { id: 'AU-101', time: '08:20', actor: 'Vikram Shah', action: 'Booking cancelled', target: 'BK-5131', reason: 'Customer submitted written cancellation within cooling-off window.' },
]

export const opsBookings: OpsBooking[] = [
  {
    id: 'BK-5190', bookedOn: daysAgoIso(0), customer: 'HCC Constructions', city: 'Hyderabad', zone: 'Madhapur', machine: 'Tower Crane 6T', amount: '₹2,96,000', status: 'Confirmed', window: '22 Sep – 12 Oct', operator: 'Unassigned', stuck: false,
    history: [
      { time: '10:02', event: 'Booking confirmed by city admin' },
      { time: '10:05', event: 'Dispatch job JOB-7801 raised' },
    ],
  },
  {
    id: 'BK-5182', bookedOn: daysAgoIso(1), customer: 'L&T Metro Rail', city: 'Hyderabad', zone: 'Madhapur', machine: 'CAT 320 Excavator', amount: '₹2,24,000', status: 'Active', window: '12 Sep – 26 Sep', operator: 'Kiran Vardhan', stuck: false,
    history: [
      { time: '12 Sep 09:40', event: 'Booking created' },
      { time: '12 Sep 10:15', event: 'Operator assigned: Kiran Vardhan' },
      { time: '12 Sep 11:02', event: 'Machine handed over at HITEC City yard' },
      { time: '18 Sep 14:20', event: 'Weekly progress report filed' },
    ],
  },
  {
    id: 'BK-5179', bookedOn: daysAgoIso(2), customer: 'MEIL', city: 'Hyderabad', zone: 'Gachibowli', machine: 'ACE Hydra Crane 14T', amount: '₹2,86,000', status: 'Active', window: '10 Sep – 30 Sep', operator: 'Sandeep Yadav', stuck: false,
    history: [
      { time: '10 Sep 08:30', event: 'Booking created' },
      { time: '10 Sep 09:12', event: 'Operator assigned: Sandeep Yadav' },
      { time: '15 Sep 16:45', event: 'Damage waiver claim raised (DSP-52)' },
    ],
  },
  {
    id: 'BK-5176', bookedOn: daysAgoIso(3), customer: 'My Home Builders', city: 'Hyderabad', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', amount: '₹1,12,000', status: 'Active', window: '18 Sep – 30 Sep', operator: 'Rakesh Naidu', stuck: false,
    history: [
      { time: '18 Sep 07:55', event: 'Booking created' },
      { time: '18 Sep 08:40', event: 'Reassigned to Rakesh Naidu (override AU-102)' },
    ],
  },
  {
    id: 'BK-5173', bookedOn: daysAgoIso(4), customer: 'Ramky Infrastructure', city: 'Hyderabad', zone: 'Uppal', machine: 'Volvo FMX Tipper', amount: '₹1,56,000', status: 'Active', window: '08 Sep – 22 Sep', operator: 'Imran Ali', stuck: true,
    history: [
      { time: '08 Sep 09:10', event: 'Booking created' },
      { time: '08 Sep 10:00', event: 'Operator assigned: Imran Ali' },
      { time: '19 Sep 09:05', event: 'Job JOB-7790 marked stuck — site access denied' },
    ],
  },
  {
    id: 'BK-5171', bookedOn: daysAgoIso(5), customer: 'Sobha Realty', city: 'Hyderabad', zone: 'Gachibowli', machine: 'Tower Crane 6T', amount: '₹3,24,000', status: 'Active', window: '20 Sep – 20 Oct', operator: 'Ayesha Siddiqui', stuck: false,
    history: [
      { time: '20 Sep 08:15', event: 'Booking created' },
      { time: '20 Sep 09:31', event: 'Dispatch job JOB-7793 raised' },
      { time: '20 Sep 11:10', event: 'Flagged at risk — SLA window closing' },
    ],
  },
  {
    id: 'BK-5164', bookedOn: daysAgoIso(8), customer: 'Vascon Engineers', city: 'Hyderabad', zone: 'Gachibowli', machine: 'JCB 3CX Backhoe', amount: '₹92,000', status: 'Completed', window: '01 Sep – 11 Sep', operator: 'Mahesh Goud', stuck: false,
    history: [
      { time: '01 Sep 09:00', event: 'Booking created' },
      { time: '11 Sep 17:30', event: 'Machine returned and inspected' },
      { time: '12 Sep 11:00', event: 'Booking completed' },
    ],
  },
  {
    id: 'BK-5168', bookedOn: daysAgoIso(6), customer: 'TSIIC', city: 'Hyderabad', zone: 'Begumpet', machine: 'Motor Grader MG-180', amount: '₹1,18,000', status: 'Active', window: '15 Sep – 27 Sep', operator: 'Venkat Rao', stuck: false,
    history: [
      { time: '15 Sep 08:45', event: 'Booking created' },
      { time: '15 Sep 09:58', event: 'Operator assigned: Venkat Rao' },
    ],
  },
  {
    id: 'BK-5191', bookedOn: daysAgoIso(1), customer: 'Vascon Engineers', city: 'Warangal', zone: 'Hanamkonda', machine: 'Backhoe Loader', amount: '₹68,000', status: 'Confirmed', window: '21 Sep – 04 Oct', operator: 'Unassigned', stuck: true,
    history: [
      { time: '21 Sep 10:20', event: 'Booking confirmed' },
      { time: '21 Sep 10:26', event: 'Dispatch job JOB-7805 raised' },
      { time: '21 Sep 12:05', event: 'Marked stuck — no operator accepted in 90 minutes' },
    ],
  },
  {
    id: 'BK-5192', bookedOn: daysAgoIso(0), customer: 'Kences Builders', city: 'Karimnagar', zone: 'Chowrasta', machine: 'Concrete Mixer', amount: '₹1,04,000', status: 'Confirmed', window: '22 Sep – 06 Oct', operator: 'Unassigned', stuck: false,
    history: [
      { time: '21 Sep 10:12', event: 'Booking confirmed' },
      { time: '21 Sep 10:18', event: 'Dispatch job JOB-7807 raised (urgent)' },
    ],
  },
  {
    id: 'BK-5140', bookedOn: daysAgoIso(9), customer: 'Deccan Roadlines', city: 'Hyderabad', zone: 'Madhapur', machine: 'JCB 3CX', amount: '₹88,000', status: 'Completed', window: '25 Aug – 06 Sep', operator: 'Ravi Teja', stuck: false,
    history: [
      { time: '25 Aug 09:20', event: 'Booking created' },
      { time: '06 Sep 18:00', event: 'Machine returned' },
      { time: '07 Sep 10:30', event: 'Booking completed' },
    ],
  },
  {
    id: 'BK-5131', bookedOn: daysAgoIso(12), customer: 'Twin Cities Builders', city: 'Hyderabad', zone: 'LB Nagar', machine: 'Skid Steer Loader', amount: '₹74,000', status: 'Cancelled', window: '30 Aug – 06 Sep', operator: 'Unassigned', stuck: false,
    history: [
      { time: '30 Aug 16:10', event: 'Booking created' },
      { time: '31 Aug 08:20', event: 'Cancelled with reason — cooling-off window (AU-101)' },
    ],
  },
]

export const vehicles: Vehicle[] = [
  { id: 'MC-3041', lastPingOn: daysAgoIso(0), model: 'CAT 320 GC', regNo: 'TS-07-HB-4412', type: 'Excavator', city: 'Hyderabad', zone: 'Madhapur', driver: 'Kiran Vardhan', status: 'On Hire', ping: '2 min ago', map: { x: 44, y: 57 } },
  { id: 'MC-3049', lastPingOn: daysAgoIso(0), model: 'Hydra Crane 14T', regNo: 'TS-07-HY-8814', type: 'Crane', city: 'Hyderabad', zone: 'Kavuri Hills', driver: 'Ravi Teja', status: 'On Hire', ping: '4 min ago', map: { x: 48, y: 62 } },
  { id: 'MC-3038', lastPingOn: daysAgoIso(0), model: 'JCB 3CX', regNo: 'TS-09-MM-2287', type: 'Backhoe Loader', city: 'Hyderabad', zone: 'Gachibowli', driver: 'Sandeep Yadav', status: 'Available', ping: '1 min ago', map: { x: 43, y: 63 } },
  { id: 'MC-3034', lastPingOn: daysAgoIso(0), model: 'ACE AG-15', regNo: 'TS-07-CW-9014', type: 'Crane', city: 'Hyderabad', zone: 'Kukatpally', driver: 'Rakesh Naidu', status: 'On Hire', ping: '6 min ago', map: { x: 46, y: 55 } },
  { id: 'MC-3031', lastPingOn: daysAgoIso(0), model: 'Schwing Stetter S4', regNo: 'TS-09-MX-7745', type: 'Concrete Mixer', city: 'Hyderabad', zone: 'Begumpet', driver: 'Venkat Rao', status: 'Inspection', ping: '22 min ago', map: { x: 49, y: 58 } },
  { id: 'MC-3019', lastPingOn: daysAgoIso(1), model: 'Volvo FMX 440', regNo: 'TS-07-TK-1178', type: 'Tipper', city: 'Hyderabad', zone: 'Uppal', driver: 'Imran Ali', status: 'Maintenance', ping: '1 hr ago', map: { x: 51, y: 60 } },
  { id: 'MC-3005', lastPingOn: daysAgoIso(0), model: 'Tower Crane TC-6', regNo: 'TS-07-TC-8853', type: 'Crane', city: 'Hyderabad', zone: 'Gachibowli', driver: 'Ayesha Siddiqui', status: 'On Hire', ping: '3 min ago', map: { x: 42, y: 60 } },
  { id: 'MC-3044', lastPingOn: daysAgoIso(0), model: 'Komatsu PC210', regNo: 'TS-09-PC-6631', type: 'Excavator', city: 'Warangal', zone: 'Hanamkonda', driver: 'Srinivas Goud', status: 'On Hire', ping: '5 min ago', map: { x: 53, y: 46 } },
  { id: 'MC-3047', lastPingOn: daysAgoIso(0), model: 'Bomag BW211', regNo: 'TS-07-BM-3352', type: 'Compactor', city: 'Warangal', zone: 'Kazipet', driver: 'Padma Rani', status: 'Available', ping: '2 min ago', map: { x: 50, y: 51 } },
  { id: 'MC-3055', lastPingOn: daysAgoIso(1), model: 'XCMG Excavator 215', regNo: 'TS-07-XC-9927', type: 'Excavator', city: 'Karimnagar', zone: 'Chowrasta', driver: 'Srinivas Goud', status: 'Inspection', ping: '40 min ago', map: { x: 57, y: 21 } },
  { id: 'MC-3061', lastPingOn: daysAgoIso(0), model: 'Sany Crane SCC500', regNo: 'TS-09-SC-7749', type: 'Crane', city: 'Karimnagar', zone: 'Chowrasta', driver: 'Padma Rani', status: 'On Hire', ping: '8 min ago', map: { x: 60, y: 24 } },
  { id: 'MC-3052', lastPingOn: daysAgoIso(0), model: 'Tata Signa Tipper', regNo: 'TS-09-SG-4471', type: 'Tipper', city: 'Nizamabad', zone: 'Bodhan Road', driver: 'Mahesh Goud', status: 'Available', ping: '3 min ago', map: { x: 17, y: 24 } },
  { id: 'MC-3058', lastPingOn: daysAgoIso(0), model: 'Putzmeister Pump', regNo: 'TS-07-PM-1163', type: 'Concrete Pump', city: 'Khammam', zone: 'Wyra Road', driver: 'Lakshmi Prasad', status: 'On Hire', ping: '7 min ago', map: { x: 69, y: 69 } },
  { id: 'MC-3059', lastPingOn: daysAgoIso(0), model: 'Tata Signa Tipper', regNo: 'TS-09-TS-3320', type: 'Tipper', city: 'Ramagundam', zone: 'Godavarikhani', driver: 'Bharat Reddy', status: 'Available', ping: '11 min ago', map: { x: 77, y: 27 } },
]

export const cityMarkers: CityMarker[] = [
  { city: 'Nizamabad', x: 18, y: 22, vehicles: 1, demand: 6 },
  { city: 'Karimnagar', x: 58, y: 22, vehicles: 2, demand: 8 },
  { city: 'Ramagundam', x: 77, y: 27, vehicles: 1, demand: 4 },
  { city: 'Siddipet', x: 34, y: 44, vehicles: 0, demand: 0 },
  { city: 'Warangal', x: 52, y: 48, vehicles: 2, demand: 12 },
  { city: 'Hyderabad', x: 46, y: 60, vehicles: 7, demand: 53 },
  { city: 'Khammam', x: 69, y: 69, vehicles: 1, demand: 5 },
  { city: 'Suryapet', x: 52, y: 78, vehicles: 0, demand: 3 },
  { city: 'Nalgonda', x: 36, y: 80, vehicles: 0, demand: 3 },
]

export const shiftRoster: ShiftMember[] = [
  { id: 'SH-1', name: 'Ayesha Khan', role: 'Dispatcher', shift: 'Morning', area: 'Hyderabad', status: 'On shift' },
  { id: 'SH-2', name: 'Gopal Verma', role: 'Dispatcher', shift: 'Morning', area: 'Warangal', status: 'On shift' },
  { id: 'SH-3', name: 'Neha Pillai', role: 'Support Lead', shift: 'Morning', area: 'Statewide', status: 'Ending soon' },
  { id: 'SH-4', name: 'Ravi Kumar', role: 'Support Agent', shift: 'Morning', area: 'Hyderabad', status: 'On break' },
  { id: 'SH-5', name: 'Divya Menon', role: 'Dispatcher', shift: 'Evening', area: 'Hyderabad', status: 'On shift' },
  { id: 'SH-6', name: 'Imtiaz Ali', role: 'Support Agent', shift: 'Evening', area: 'Karimnagar', status: 'On shift' },
  { id: 'SH-7', name: 'Sanjana Rao', role: 'Dispatcher', shift: 'Evening', area: 'Nizamabad', status: 'On break' },
  { id: 'SH-8', name: 'Karthik Iyer', role: 'Support Agent', shift: 'Night', area: 'Statewide', status: 'Ending soon' },
]

export const seedHandoverNotes: HandoverNote[] = [
  { id: 'HN-3', date: daysAgoIso(0), time: '09:45', author: 'Neha Pillai', text: 'Morning queue healthy except Hyderabad cranes. Watch JOB-7801 — metro site outage, customer calling at noon.' },
  { id: 'HN-2', date: daysAgoIso(0), time: '08:30', author: 'Ayesha Khan', text: 'Two dispatchers covering Warangal until 14:00. Karimnagar crew shortage flagged to zone manager.' },
  { id: 'HN-1', date: daysAgoIso(1), time: '07:00', author: 'Vikram Shah', text: 'Night shift handed over with 4 open escalations. No critical incidents overnight.' },
]

export const shiftLog: ShiftLogEntry[] = [
  { id: 'SL-6', date: daysAgoIso(0), time: '10:41', type: 'Incident', author: 'Sanjana Rao', text: 'JOB-7809 raised with no operator available in Bodhan Road.' },
  { id: 'SL-5', date: daysAgoIso(0), time: '10:26', type: 'Action', author: 'Gopal Verma', text: 'Requested Warangal standby crew for JOB-7805.' },
  { id: 'SL-4', date: daysAgoIso(0), time: '10:05', type: 'Incident', author: 'Ayesha Khan', text: 'Urgent crane request JOB-7801 entered the queue.' },
  { id: 'SL-3', date: daysAgoIso(0), time: '09:34', type: 'Action', author: 'Vikram Shah', text: 'Prioritized JOB-7801 after metro outage call.' },
  { id: 'SL-2', date: daysAgoIso(1), time: '09:12', type: 'Note', author: 'Neha Pillai', text: 'Evening roster confirmed — Divya Menon covers Hyderabad.' },
  { id: 'SL-1', date: daysAgoIso(1), time: '08:47', type: 'Action', author: 'Vikram Shah', text: 'Reassigned JOB-7798 after operator dropout.' },
]

export const escalations: Escalation[] = [
  { id: 'ESC-14', receivedOn: daysAgoIso(0), from: 'Ayesha Khan', role: 'Dispatcher', city: 'Hyderabad', subject: 'Unassigned queue past SLA', detail: '18 jobs waiting over 30 minutes with only 9 operators free statewide.', received: '12 min ago', severity: 'Critical', status: 'New' },
  { id: 'ESC-13', receivedOn: daysAgoIso(0), from: 'Padma Rani', role: 'Zone manager', city: 'Karimnagar', subject: 'Evening crew shortage', detail: 'Chowrasta demand is 8 jobs against 6 ready machines — need relief crews.', received: '40 min ago', severity: 'Warning', status: 'Acknowledged' },
  { id: 'ESC-12', receivedOn: daysAgoIso(1), from: 'Sanjana Rao', role: 'Zone manager', city: 'Nizamabad', subject: 'Cancellation spike', detail: 'Machine-unavailable cancellations doubled; partner fleet under maintenance.', received: '2 hours ago', severity: 'Warning', status: 'New' },
  { id: 'ESC-11', receivedOn: daysAgoIso(1), from: 'Gopal Verma', role: 'Dispatcher', city: 'Warangal', subject: 'Crane SLA breach', detail: 'Three crane bookings breached 45-minute dispatch SLA since morning.', received: '3 hours ago', severity: 'Critical', status: 'Escalated', escalatedTo: 'State admin · Anitha Rao' },
  { id: 'ESC-10', receivedOn: daysAgoIso(2), from: 'Ramesh Pawar', role: 'Zone manager', city: 'Ramagundam', subject: 'Payout block delaying dispatch', detail: 'Partner unwilling to send tipper until last week’s payout clears.', received: '5 hours ago', severity: 'Warning', status: 'New' },
  { id: 'ESC-09', receivedOn: daysAgoIso(3), from: 'Ravi Kumar', role: 'Dispatcher', city: 'Hyderabad', subject: 'Live map gaps', detail: 'Twelve vehicles stopped reporting location for 20 minutes.', received: 'Yesterday', severity: 'Info', status: 'Acknowledged' },
]

export const escalationTargets = [
  'City admin · Hyderabad · Praveen Kumar',
  'City admin · Warangal · Meghana Das',
  'State admin · Anitha Rao',
]

export const disputes: Dispute[] = [
  {
    id: 'DSP-52',
    kind: 'Dispute',
    bookingId: 'BK-5179',
    raisedBy: 'MEIL',
    against: 'Charminar Plant Hire',
    category: 'Damage waiver claim',
    amount: '₹24,000',
    status: 'Open',
    opened: '15 Sep',
    priority: 'Critical',
    summary:
      'The customer claims the 14T crane was delivered with a bent jib section and has rejected the damage waiver. The machine has been idle for four days while the claim is assessed.',
    machine: 'ACE Hydra Crane 14T',
    locality: 'Gachibowli',
    daysOpen: 12,
    targetDays: 5,
    owner: 'City admin · Hyderabad',
    lastUpdate: 'Yesterday · 17:20',
    evidenceCount: 4,
    nextStep: 'City admin to confirm the pre-handover damage photos and release the waiver decision.',
    timeline: [
      { time: '15 Sep · 10:12', event: 'Claim raised by MEIL with three site photos attached' },
      { time: '16 Sep · 09:40', event: 'Zone operator statement added to the case file' },
      { time: '18 Sep · 11:05', event: 'Escalated to the city admin — claim above the zone limit' },
      { time: 'Yesterday · 17:20', event: 'Awaiting the city admin decision on the waiver' },
    ],
  },
  {
    id: 'DSP-51',
    kind: 'Dispute',
    bookingId: 'BK-5131',
    raisedBy: 'Twin Cities Builders',
    against: 'Twin Cities Liftways',
    category: 'Late delivery',
    amount: '₹6,800',
    status: 'Under Review',
    opened: '31 Aug',
    priority: 'High',
    summary:
      'The excavator reached site two days after the agreed slot, which pushed the foundation work back. The customer is claiming standby charges for the delay.',
    machine: 'CAT 320 Excavator',
    locality: 'Kukatpally',
    daysOpen: 21,
    targetDays: 7,
    owner: 'City admin · Hyderabad',
    lastUpdate: '3 days ago · 12:15',
    evidenceCount: 2,
    nextStep: 'Dispatch to confirm the original slot and whether the delay was crew or machine availability.',
    timeline: [
      { time: '31 Aug · 16:44', event: 'Claim raised for a two-day late delivery' },
      { time: '01 Sep · 08:15', event: 'Dispatch confirmed the machine was held on an earlier booking' },
      { time: '03 Sep · 14:30', event: 'Standby invoice for ₹6,800 attached by the customer' },
      { time: '3 days ago · 12:15', event: 'Slot logs requested from the dispatch desk' },
    ],
  },
  {
    id: 'DSP-50',
    kind: 'Dispute',
    bookingId: 'BK-5140',
    raisedBy: 'Deccan Roadlines',
    against: 'Deccan Heavy Machinery',
    category: 'Billing mismatch',
    amount: '₹3,200',
    status: 'Resolved',
    opened: '07 Sep',
    priority: 'Low',
    summary:
      'The invoice billed a full extra day after the machine was released early. The credit note was raised and the difference refunded.',
    machine: 'JCB 3CX Backhoe',
    locality: 'Madhapur',
    daysOpen: 9,
    targetDays: 7,
    owner: 'Closed',
    lastUpdate: '16 Sep · 10:05',
    evidenceCount: 2,
    nextStep: 'None — resolved with a credit note.',
    timeline: [
      { time: '07 Sep · 09:20', event: 'Billing mismatch reported by the customer' },
      { time: '09 Sep · 11:00', event: 'Release log confirmed the early return' },
      { time: '16 Sep · 10:05', event: 'Credit note issued and the case closed' },
    ],
  },
  {
    id: 'TCK-118',
    kind: 'Ticket',
    bookingId: 'BK-5164',
    raisedBy: 'Vascon Engineers',
    against: 'Operator conduct',
    category: 'Site behaviour complaint',
    status: 'Under Review',
    opened: '12 Sep',
    priority: 'High',
    summary:
      'The customer reports that the operator refused to reverse into a restricted area without a banksman. A behaviour review is under way with the zone operator.',
    machine: 'Volvo FMX Tipper',
    locality: 'Uppal',
    daysOpen: 9,
    targetDays: 5,
    owner: 'Support admin · Hyderabad',
    lastUpdate: 'Yesterday · 09:40',
    evidenceCount: 1,
    nextStep: 'Support to interview the operator and the site supervisor and record the finding.',
    timeline: [
      { time: '12 Sep · 13:10', event: 'Behaviour complaint raised by the site manager' },
      { time: '13 Sep · 10:25', event: 'Operator statement collected by the zone lead' },
      { time: 'Yesterday · 09:40', event: 'Support admin picked the case for review' },
    ],
  },
  {
    id: 'DSP-48',
    kind: 'Dispute',
    bookingId: 'BK-5168',
    raisedBy: 'TSIIC',
    against: 'Charminar Plant Hire',
    category: 'Machine downtime',
    amount: '₹11,500',
    status: 'Open',
    opened: '18 Sep',
    priority: 'High',
    summary:
      'The mixer lost hydraulics twice on the same shift and the customer is claiming the standby hours for the affected days.',
    machine: 'Schwing Stetter Mixer',
    locality: 'Raidurg',
    daysOpen: 8,
    targetDays: 5,
    owner: 'City admin · Hyderabad',
    lastUpdate: 'Yesterday · 11:30',
    evidenceCount: 3,
    nextStep: 'Workshop to confirm the repair hours so the standby claim can be settled.',
    timeline: [
      { time: '18 Sep · 15:05', event: 'Downtime claim raised for two shifts' },
      { time: '19 Sep · 08:40', event: 'Workshop confirmed a hydraulic hose failure' },
      { time: 'Yesterday · 11:30', event: 'Repair hours and standby log requested from the workshop' },
    ],
  },
  {
    id: 'TCK-121',
    kind: 'Ticket',
    bookingId: 'BK-5173',
    raisedBy: 'Ramky Infrastructure',
    against: 'Site access',
    category: 'Stuck job assistance',
    status: 'Open',
    opened: '19 Sep',
    priority: 'Medium',
    summary:
      'The crew was turned away from the site entry for the second time this month and the job was re-timed. The ticket is with dispatch to confirm the entry arrangement.',
    machine: 'Volvo FMX Tipper',
    locality: 'Uppal',
    daysOpen: 7,
    targetDays: 3,
    owner: 'Dispatch desk · Hyderabad',
    lastUpdate: 'Today · 08:15',
    evidenceCount: 2,
    nextStep: 'Dispatch to confirm the entry pass with the customer site before the next slot.',
    timeline: [
      { time: '19 Sep · 07:35', event: 'Site access denial reported from the crew' },
      { time: '20 Sep · 10:50', event: 'Second denial logged for the same gate' },
      { time: 'Today · 08:15', event: 'Escalated to the dispatch desk to confirm the entry pass' },
    ],
  },
  {
    id: 'DSP-47',
    kind: 'Dispute',
    bookingId: 'BK-5160',
    raisedBy: 'Phoenix Green Homes',
    against: 'Charminar Plant Hire',
    category: 'Delay in mobilisation',
    amount: '₹8,900',
    status: 'Open',
    opened: '20 Sep',
    priority: 'Medium',
    summary:
      'The grader reached site four hours after the agreed mobilisation time and the customer is claiming a mobilisation penalty.',
    machine: 'Motor Grader MG-180',
    locality: 'Begumpet',
    daysOpen: 6,
    targetDays: 5,
    owner: 'Dispatch desk · Hyderabad',
    lastUpdate: 'Yesterday · 16:10',
    evidenceCount: 1,
    nextStep: 'Dispatch to confirm the mobilisation time recorded by the site in the gate log.',
    timeline: [
      { time: '20 Sep · 11:20', event: 'Mobilisation delay reported by the site manager' },
      { time: 'Yesterday · 16:10', event: 'Gate log requested from the yard team' },
    ],
  },
  {
    id: 'TCK-119',
    kind: 'Ticket',
    bookingId: 'BK-5151',
    raisedBy: 'Deccan Roadlines',
    against: 'Operator not present at site',
    category: 'Crew availability',
    status: 'Under Review',
    opened: '14 Sep',
    priority: 'Medium',
    summary:
      'The machine reached the site without an operator and the customer was charged the full shift. The crew roster for the morning is being checked.',
    machine: 'Tower Crane 6T',
    locality: 'Madhapur',
    daysOpen: 7,
    targetDays: 5,
    owner: 'Support admin · Hyderabad',
    lastUpdate: '2 days ago · 14:25',
    evidenceCount: 2,
    nextStep: 'Support to compare the crew roster with the shift handover for that morning.',
    timeline: [
      { time: '14 Sep · 12:40', event: 'Crew availability complaint raised' },
      { time: '15 Sep · 09:05', event: 'Shift handover sheet collected' },
      { time: '2 days ago · 14:25', event: 'Roster review assigned to the support admin' },
    ],
  },
  {
    id: 'DSP-46',
    kind: 'Dispute',
    bookingId: 'BK-5146',
    raisedBy: 'My Home Nexus',
    against: 'Charminar Plant Hire',
    category: 'Wrong machine delivered',
    amount: '₹15,000',
    status: 'Resolved',
    opened: '10 Sep',
    priority: 'Medium',
    summary:
      'A compactor was sent instead of the booked roller. The customer used the machine for a day before the swap, and the rate difference was credited.',
    machine: 'Compactor RM-800',
    locality: 'Manikonda',
    daysOpen: 4,
    targetDays: 5,
    owner: 'Closed',
    lastUpdate: '14 Sep · 11:50',
    evidenceCount: 1,
    nextStep: 'None — resolved with a rate credit.',
    timeline: [
      { time: '10 Sep · 08:50', event: 'Wrong machine reported at handover' },
      { time: '11 Sep · 07:30', event: 'Correct roller swapped in on site' },
      { time: '14 Sep · 11:50', event: 'Rate difference credited and the case closed' },
    ],
  },
  {
    id: 'TCK-122',
    kind: 'Ticket',
    bookingId: 'BK-5177',
    raisedBy: 'Sobha Realty',
    against: 'Fuel surcharge',
    category: 'Billing query',
    status: 'Open',
    opened: '20 Sep',
    priority: 'Low',
    summary:
      'The customer queried the fuel surcharge applied to the last invoice. The rate card applied matches the published rate, so a confirmation is pending.',
    machine: 'JCB 3DX',
    locality: 'Gachibowli',
    daysOpen: 1,
    targetDays: 7,
    owner: 'Finance admin · Hyderabad',
    lastUpdate: 'Today · 09:05',
    evidenceCount: 1,
    nextStep: 'Finance to confirm the surcharge rate against the published rate card.',
    timeline: [{ time: 'Today · 09:05', event: 'Billing query raised and routed to finance' }],
  },
  {
    id: 'DSP-45',
    kind: 'Dispute',
    bookingId: 'BK-5182',
    raisedBy: 'L&T Metro Rail',
    against: 'Charminar Plant Hire',
    category: 'Overtime claim on crane',
    amount: '₹21,500',
    status: 'Open',
    opened: '21 Sep',
    priority: 'Critical',
    summary:
      'The customer is claiming 26 hours of crane overtime that the site log does not support. The lift was stopped for safety reasons and the claim needs a city admin decision.',
    machine: 'Tower Crane 6T',
    locality: 'HITEC City',
    daysOpen: 1,
    targetDays: 3,
    owner: 'City admin · Hyderabad',
    lastUpdate: 'Today · 08:40',
    evidenceCount: 5,
    nextStep: 'City admin to review the lift log and decide the overtime claim.',
    timeline: [
      { time: '21 Sep · 07:15', event: 'Overtime claim raised for 26 hours' },
      { time: '21 Sep · 08:40', event: 'Lift log and safety stop record attached by dispatch' },
    ],
  },
  {
    id: 'TCK-123',
    kind: 'Ticket',
    bookingId: 'BK-5162',
    raisedBy: 'Aparna Constructions',
    against: 'Safety equipment',
    category: 'Site safety gear missing',
    status: 'Under Review',
    opened: '16 Sep',
    priority: 'High',
    summary:
      'The crew arrived without the full safety kit for the shift. The site turned the machine away and a toolkit audit has been raised across the zone.',
    machine: 'ACE Hydra Crane 14T',
    locality: 'Madhapur',
    daysOpen: 5,
    targetDays: 5,
    owner: 'Support admin · Hyderabad',
    lastUpdate: 'Yesterday · 10:15',
    evidenceCount: 2,
    nextStep: 'Support to close the toolkit audit and confirm every crew is complete before the next shift.',
    timeline: [
      { time: '16 Sep · 06:55', event: 'Site refused the machine over missing safety gear' },
      { time: '17 Sep · 09:20', event: 'Toolkit audit raised across the zone crews' },
      { time: 'Yesterday · 10:15', event: 'Audit findings shared with the support admin' },
    ],
  },
]

export const responseByCity: ResponseRow[] = [
  { city: 'Hyderabad', minutes: 31, trend: '-2 min' },
  { city: 'Warangal', minutes: 36, trend: '+1 min' },
  { city: 'Karimnagar', minutes: 38, trend: '+3 min' },
  { city: 'Khammam', minutes: 39, trend: '+2 min' },
  { city: 'Nizamabad', minutes: 41, trend: '+5 min' },
  { city: 'Ramagundam', minutes: 43, trend: '+4 min' },
  { city: 'Suryapet', minutes: 44, trend: '+1 min' },
  { city: 'Nalgonda', minutes: 47, trend: '+6 min' },
  { city: 'Siddipet', minutes: null, trend: '—' },
]

export const timeUnassigned: UnassignedRow[] = [
  { zone: 'Bodhan Road', minutes: 27 },
  { zone: 'Miryalaguda Road', minutes: 22 },
  { zone: 'Chowrasta', minutes: 24 },
  { zone: 'Hanamkonda', minutes: 19 },
  { zone: 'Uppal', minutes: 16 },
  { zone: 'Kukatpally', minutes: 14 },
  { zone: 'Gachibowli', minutes: 11 },
  { zone: 'Madhapur', minutes: 9 },
]

export const overrideSeries: OverridePoint[] = [
  { month: 'Apr', overrides: 38 },
  { month: 'May', overrides: 42 },
  { month: 'Jun', overrides: 51 },
  { month: 'Jul', overrides: 47 },
  { month: 'Aug', overrides: 55 },
  { month: 'Sep', overrides: 61 },
]

export const cancellationsByReason: CancellationRow[] = [
  { reason: 'Machine unavailable', count: 21, pct: 33 },
  { reason: 'Customer delay', count: 16, pct: 25 },
  { reason: 'Weather', count: 11, pct: 17 },
  { reason: 'Payment failed', count: 9, pct: 14 },
  { reason: 'Other', count: 7, pct: 11 },
]

// Zone-scoped report data for Madhapur zone only
export const zoneReportPeriods = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

export const zoneResponseByCity: ResponseRow[] = [
  { city: 'Hyderabad', minutes: 28, trend: '-2 min' },
]

export const zoneTimeUnassigned: UnassignedRow[] = [
  { zone: 'Madhapur', minutes: 9 },
]

export const zoneOverrideSeries: OverridePoint[] = [
  { month: 'Apr', overrides: 12 },
  { month: 'May', overrides: 14 },
  { month: 'Jun', overrides: 17 },
  { month: 'Jul', overrides: 15 },
  { month: 'Aug', overrides: 18 },
  { month: 'Sep', overrides: 20 },
]

export const zoneCancellationsByReason: CancellationRow[] = [
  { reason: 'Machine unavailable', count: 7, pct: 35 },
  { reason: 'Customer delay', count: 5, pct: 25 },
  { reason: 'Weather', count: 4, pct: 20 },
  { reason: 'Payment failed', count: 3, pct: 15 },
  { reason: 'Other', count: 1, pct: 5 },
]

// Zone-scoped booking trends for Madhapur
export type BookingTrendRow = {
  date: string
  bookings: number
  completed: number
  cancelled: number
  revenue: number
}

export const zoneBookingTrends: BookingTrendRow[] = [
  { date: 'Sep 1', bookings: 42, completed: 38, cancelled: 4, revenue: 85000 },
  { date: 'Sep 2', bookings: 38, completed: 34, cancelled: 4, revenue: 72000 },
  { date: 'Sep 3', bookings: 45, completed: 41, cancelled: 4, revenue: 91000 },
  { date: 'Sep 4', bookings: 52, completed: 47, cancelled: 5, revenue: 105000 },
  { date: 'Sep 5', bookings: 48, completed: 44, cancelled: 4, revenue: 96000 },
  { date: 'Sep 6', bookings: 41, completed: 37, cancelled: 4, revenue: 82000 },
  { date: 'Sep 7', bookings: 39, completed: 35, cancelled: 4, revenue: 78000 },
  { date: 'Sep 8', bookings: 46, completed: 42, cancelled: 4, revenue: 92000 },
  { date: 'Sep 9', bookings: 49, completed: 45, cancelled: 4, revenue: 98000 },
  { date: 'Sep 10', bookings: 44, completed: 40, cancelled: 4, revenue: 88000 },
  { date: 'Sep 11', bookings: 47, completed: 43, cancelled: 4, revenue: 94000 },
  { date: 'Sep 12', bookings: 51, completed: 46, cancelled: 5, revenue: 102000 },
  { date: 'Sep 13', bookings: 43, completed: 39, cancelled: 4, revenue: 86000 },
  { date: 'Sep 14', bookings: 40, completed: 36, cancelled: 4, revenue: 80000 },
  { date: 'Sep 15', bookings: 48, completed: 44, cancelled: 4, revenue: 96000 },
]

// Zone-scoped vehicle status breakdown for Madhapur
export type VehicleStatusRow = {
  status: string
  count: number
  pct: number
}

export const zoneVehicleStatus: VehicleStatusRow[] = [
  { status: 'On Hire', count: 28, pct: 56 },
  { status: 'Available', count: 12, pct: 24 },
  { status: 'Maintenance', count: 6, pct: 12 },
  { status: 'Inspection', count: 4, pct: 8 },
]

// Zone-scoped maintenance requests for Madhapur
export type MaintenanceReportRow = {
  machine: string
  locality: string
  type: string
  cost: string
  status: string
}

export const zoneMaintenanceReport: MaintenanceReportRow[] = [
  { machine: 'CAT 320 Excavator', locality: 'HITEC City', type: 'Hydraulic hose replacement', cost: '₹12,800', status: 'Pending' },
  { machine: 'Volvo FMX Tipper', locality: 'Kondapur', type: 'Brake-pad replacement', cost: '₹9,400', status: 'Approved' },
  { machine: 'Schwing Stetter Mixer', locality: 'Raidurg', type: 'Drum inspection', cost: '₹6,200', status: 'Completed' },
  { machine: 'Hydra Crane Fleet', locality: 'Raidurg', type: '500-hour service', cost: '₹36,000', status: 'Completed' },
  { machine: 'ACE Hydra Crane 14T', locality: 'Manikonda', type: 'Boom cylinder seal', cost: '₹15,600', status: 'Overdue' },
  { machine: 'CAT 320 Excavator', locality: 'Nanakramguda', type: 'Bucket teeth replacement', cost: '₹7,800', status: 'Pending' },
  { machine: 'JCB 3CX Backhoe', locality: 'Kondapur', type: 'Engine oil change', cost: '₹4,500', status: 'Completed' },
  { machine: 'Tower Crane 6T', locality: 'HITEC City', type: 'Cable inspection', cost: '₹11,200', status: 'Approved' },
]

// Zone-scoped support tickets for Madhapur
export type SupportReportRow = {
  type: string
  tickets: number
  resolved: number
  reopened: number
  avgResponseMins: number
}

export const zoneSupportReport: SupportReportRow[] = [
  { type: 'Maintenance', tickets: 12, resolved: 9, reopened: 1, avgResponseMins: 15 },
  { type: 'Incident', tickets: 6, resolved: 4, reopened: 0, avgResponseMins: 22 },
  { type: 'Refund', tickets: 4, resolved: 3, reopened: 1, avgResponseMins: 18 },
  { type: 'Change Request', tickets: 3, resolved: 2, reopened: 0, avgResponseMins: 14 },
]

// Zone-scoped staff performance for Madhapur
export type StaffReportRow = {
  name: string
  role: string
  jobs: number
  rating: number
  status: string
}

export const zoneStaffReport: StaffReportRow[] = [
  { name: 'Kiran Vardhan', role: 'Zone Operator', jobs: 42, rating: 4.9, status: 'Active' },
  { name: 'Sunita Devi', role: 'Zone Operator', jobs: 38, rating: 4.8, status: 'Active' },
  { name: 'Ravi Teja', role: 'Zone Operator', jobs: 35, rating: 4.7, status: 'Active' },
  { name: 'Fatima Zahra', role: 'Zone Operator', jobs: 31, rating: 4.8, status: 'Active' },
  { name: 'Bharat Reddy', role: 'Zone Operator', jobs: 28, rating: 4.6, status: 'Active' },
  { name: 'Arjun Deshmukh', role: 'Zone Operator', jobs: 15, rating: 4.4, status: 'On leave' },
]

// Zone-scoped booking status summary for Madhapur
export type BookingStatusRow = {
  status: string
  count: number
}

export const zoneBookingStatus: BookingStatusRow[] = [
  { status: 'Active', count: 28 },
  { status: 'Completed', count: 156 },
  { status: 'Confirmed', count: 12 },
  { status: 'Cancelled', count: 20 },
]

// Zone-scoped escalation summary for Madhapur
export type EscalationReportRow = {
  severity: string
  count: number
}

export const zoneEscalationReport: EscalationReportRow[] = [
  { severity: 'Critical', count: 3 },
  { severity: 'Warning', count: 5 },
  { severity: 'Info', count: 2 },
]

// Zone financial summary
export const zoneFinancialSummary = {
  totalRevenue: 1180000,
  pendingPayments: 86400,
  totalBookings: 280,
  completedBookings: 156,
  cancelledBookings: 20,
  avgBookingValue: 4214,
}

export const opsNotifications: OpsNotification[] = [
  {
    id: 'on-1',
    category: 'Escalation',
    title: 'Unassigned queue breaching SLA',
    detail: '18 Hyderabad jobs waiting past 30 minutes.',
    time: '12 min ago',
    tone: 'red',
    priority: 'Critical',
    read: false,
    target: 'dispatch',
    zone: 'Madhapur',
    city: 'Hyderabad',
    relatedId: 'ESC-14',
  },
  {
    id: 'on-2',
    category: 'Escalation',
    title: 'New escalation received',
    detail: 'ESC-14 from Ayesha Khan · Hyderabad dispatcher.',
    time: '12 min ago',
    tone: 'amber',
    priority: 'High',
    read: false,
    target: 'escalations',
    zone: 'Madhapur',
    city: 'Hyderabad',
    relatedId: 'ESC-14',
  },
  {
    id: 'on-3',
    category: 'Booking',
    title: 'Job marked stuck',
    detail: 'JOB-7790 — site access denied at Uppal.',
    time: '1 hour ago',
    tone: 'blue',
    priority: 'High',
    read: false,
    target: 'bookings',
    zone: 'Uppal',
    city: 'Hyderabad',
    relatedId: 'JOB-7790',
  },
  {
    id: 'on-4',
    category: 'Vehicle',
    title: 'Vehicle allocation changed',
    detail: 'JOB-7802 assigned to Sandeep Yadav (AU-104).',
    time: '1 hour ago',
    tone: 'green',
    priority: 'Normal',
    read: true,
    target: 'dispatch',
    zone: 'Gachibowli',
    city: 'Hyderabad',
    relatedId: 'JOB-7802',
  },
  {
    id: 'on-5',
    category: 'Shift',
    title: 'Handover note added',
    detail: 'Neha Pillai flagged the crane queue for noon.',
    time: '2 hours ago',
    tone: 'blue',
    priority: 'Normal',
    read: true,
    target: 'shift',
    zone: 'Madhapur',
    city: 'Hyderabad',
  },
  {
    id: 'on-6',
    category: 'Booking',
    title: 'New booking confirmed',
    detail: 'BK-5194 · HCC Constructions · Tower Crane 6T · Madhapur.',
    time: '2 hours ago',
    tone: 'amber',
    priority: 'High',
    read: false,
    target: 'bookings',
    zone: 'Madhapur',
    city: 'Hyderabad',
    relatedId: 'BK-5194',
  },
  {
    id: 'on-7',
    category: 'Pickup',
    title: 'Upcoming pickup — Tower Crane',
    detail: 'JOB-7801 pickup scheduled in 45 minutes at HITEC City.',
    time: '3 hours ago',
    tone: 'amber',
    priority: 'High',
    read: false,
    target: 'dispatch',
    zone: 'Madhapur',
    city: 'Hyderabad',
    relatedId: 'JOB-7801',
  },
  {
    id: 'on-8',
    category: 'Return',
    title: 'Overdue return — JCB 3CX Backhoe',
    detail: 'BK-5164 machine return was due yesterday at Gachibowli yard.',
    time: '4 hours ago',
    tone: 'red',
    priority: 'Critical',
    read: false,
    target: 'vehicles',
    zone: 'Gachibowli',
    city: 'Hyderabad',
    relatedId: 'BK-5164',
  },
  {
    id: 'on-9',
    category: 'Delivery',
    title: 'Delayed delivery — Excavator',
    detail: 'CAT 320 GC delivery to Karimnagar delayed by 2 hours due to breakdown.',
    time: '5 hours ago',
    tone: 'red',
    priority: 'High',
    read: false,
    target: 'vehicles',
    zone: 'Chowrasta',
    city: 'Karimnagar',
    relatedId: 'JOB-7805',
  },
  {
    id: 'on-10',
    category: 'Maintenance',
    title: 'Maintenance issue — Schwing Stetter Mixer',
    detail: 'MC-3031 flagged for inspection — hydraulic leak detected.',
    time: '5 hours ago',
    tone: 'amber',
    priority: 'High',
    read: false,
    target: 'vehicles',
    zone: 'Begumpet',
    city: 'Hyderabad',
    relatedId: 'MC-3031',
  },
  {
    id: 'on-11',
    category: 'Incident',
    title: 'Site incident — LB Nagar',
    detail: 'Operator reported minor equipment contact at TSIIC site. No injuries.',
    time: '6 hours ago',
    tone: 'red',
    priority: 'Critical',
    read: false,
    target: 'bookings',
    zone: 'LB Nagar',
    city: 'Hyderabad',
    relatedId: 'BK-5131',
  },
  {
    id: 'on-12',
    category: 'Deadline',
    title: 'Approaching deadline — BK-5179',
    detail: 'Return window closes in 24 hours — ACE Hydra Crane 14T at Gachibowli.',
    time: '7 hours ago',
    tone: 'amber',
    priority: 'High',
    read: false,
    target: 'bookings',
    zone: 'Gachibowli',
    city: 'Hyderabad',
    relatedId: 'BK-5179',
  },
  {
    id: 'on-13',
    category: 'Vehicle',
    title: 'Vehicle breakdown — Warangal',
    detail: 'Tata Signa Tipper broke down en route to Kazipet site.',
    time: '8 hours ago',
    tone: 'red',
    priority: 'High',
    read: true,
    target: 'vehicles',
    zone: 'Kazipet',
    city: 'Warangal',
    relatedId: 'MC-3052',
  },
  {
    id: 'on-14',
    category: 'Delivery',
    title: 'Delivery completed — Warangal',
    detail: 'Backhoe Loader delivered to Hanamkonda site — JOB-7805.',
    time: '9 hours ago',
    tone: 'green',
    priority: 'Normal',
    read: true,
    target: 'dispatch',
    zone: 'Hanamkonda',
    city: 'Warangal',
    relatedId: 'JOB-7805',
  },
  {
    id: 'on-15',
    category: 'Booking',
    title: 'Booking cancelled — Twin Cities Builders',
    detail: 'BK-5131 cancelled within cooling-off window — Skid Steer Loader released.',
    time: '1 day ago',
    tone: 'green',
    priority: 'Normal',
    read: true,
    target: 'bookings',
    zone: 'LB Nagar',
    city: 'Hyderabad',
    relatedId: 'BK-5131',
  },
]

export const notificationPreferences: NotificationPreference[] = [
  { category: 'Booking', enabled: true, priority: 'High' },
  { category: 'Vehicle', enabled: true, priority: 'High' },
  { category: 'Pickup', enabled: true, priority: 'High' },
  { category: 'Return', enabled: true, priority: 'Critical' },
  { category: 'Delivery', enabled: true, priority: 'Normal' },
  { category: 'Maintenance', enabled: true, priority: 'High' },
  { category: 'Incident', enabled: true, priority: 'Critical' },
  { category: 'Deadline', enabled: true, priority: 'High' },
  { category: 'Escalation', enabled: true, priority: 'Critical' },
  { category: 'Shift', enabled: true, priority: 'Normal' },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']
