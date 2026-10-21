// Zone-scoped seed data for the Madhapur Zone Admin dashboard.
// Figures nest inside Hyderabad (City Admin) and Telangana (State Admin):
// state 486 machines / 2,518 bookings → city 212 / 1,286 → zone 52 / 336.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId = 'overview' | 'localities' | 'operators' | 'bookings' | 'fleet' | 'requests' | 'users' | 'approvals' | 'payments' | 'dispatch' | 'support' | 'rules' | 'notifications' | 'reports' | 'audit'

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type ZoneKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export type LocalityRow = {
  id: string
  name: string
  machines: number
  operators: number
  openJobs: number
  utilization: number
  status: 'Active' | 'Review'
}

export type OperatorStatus = 'Verified' | 'Pending' | 'Suspended'

export type OperatorRow = {
  id: string
  name: string
  locality: string
  licence: string
  rating: number
  jobs: number
  status: OperatorStatus
  joined: string
}

export type BookingStatus = 'Confirmed' | 'Active' | 'Completed' | 'Cancelled'

export type BookingRow = {
  id: string
  customer: string
  locality: string
  machine: string
  amount: string
  status: BookingStatus
  window: string
}

export type MachineStatus = 'Available' | 'Rented' | 'Maintenance' | 'Inspection'

export type MachineRow = {
  id: string
  model: string
  regNo: string
  type: string
  locality: string
  partner: string
  status: MachineStatus
  utilization: number
  dailyRate: string
}

export type RequestType = 'Maintenance' | 'Incident' | 'Refund' | 'Change Request'
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected'

export type RequestItem = {
  id: string
  type: RequestType
  requester: string
  locality: string
  detail: string
  submitted: string
  value?: string
  status: RequestStatus
}

export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type ZoneNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: string
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info'

export type ZoneAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: AlertSeverity
  target: string
}

export type ActivityItem = {
  id: string
  time: string
  actor: string
  action: string
  target: string
}

export type MonthlyPoint = {
  month: string
  revenue: number
  bookings: number
  utilization: number
}

export type HierarchyLevel = {
  level: 'State' | 'City' | 'Zone'
  name: string
  role: string
  metrics: string[]
}

export const zoneProfile = {
  state: 'Telangana',
  city: 'Hyderabad',
  name: 'Madhapur',
  area: 'HITEC City corridor',
  adminName: 'Sridhar Nair',
  adminEmail: emailForRole('zone-admin'),
  adminInitials: 'SN',
}

// State → city → zone context shown on the overview; keep in sync with
// stateAdminData (Telangana) and cityAdminData (Hyderabad).
export const hierarchy: HierarchyLevel[] = [
  {
    level: 'State',
    name: 'Telangana',
    role: 'State admin · Anitha Rao',
    metrics: ['₹8.71M revenue', '2,518 bookings', '486 machines', '89% utilization'],
  },
  {
    level: 'City',
    name: 'Hyderabad',
    role: 'City admin · Praveen Kumar',
    metrics: ['₹4.62M revenue', '1,286 bookings', '212 machines · 298 operators', '93% utilization · 6 zones'],
  },
  {
    level: 'Zone',
    name: 'Madhapur',
    role: 'Zone admin · Sridhar Nair',
    metrics: ['₹1.18M revenue', '336 bookings', '52 machines · 68 operators', '96% utilization · 6 localities'],
  },
]

export const zoneKpis: ZoneKpi[] = [
  {
    label: 'Zone revenue',
    value: '₹1.18M',
    change: '+22.4%',
    tone: 'green',
    description: 'Gross rental revenue recorded across Madhapur this month.',
    target: 'bookings',
  },
  {
    label: 'Active bookings',
    value: '336',
    change: '+17.1%',
    tone: 'blue',
    description: 'Booking requests handled across the six zone localities.',
    target: 'bookings',
  },
  {
    label: 'Fleet utilization',
    value: '96%',
    change: '+4.8%',
    tone: 'purple',
    description: 'Share of on-hire machines — highest of Hyderabad’s six zones.',
    target: 'fleet',
  },
  {
    label: 'Active operators',
    value: '68',
    change: '+9',
    tone: 'orange',
    description: 'Badge-cleared operators available for dispatch this month.',
    target: 'operators',
  },
]

export const monthlySeries: MonthlyPoint[] = [
  { month: 'Apr', revenue: 8, bookings: 210, utilization: 84 },
  { month: 'May', revenue: 9, bookings: 228, utilization: 87 },
  { month: 'Jun', revenue: 10, bookings: 249, utilization: 90 },
  { month: 'Jul', revenue: 10, bookings: 261, utilization: 91 },
  { month: 'Aug', revenue: 11, bookings: 302, utilization: 94 },
  { month: 'Sep', revenue: 12, bookings: 336, utilization: 96 },
]

export const localityRows: LocalityRow[] = [
  { id: 'lc-mad-1', name: 'HITEC City', machines: 14, operators: 18, openJobs: 4, utilization: 98, status: 'Active' },
  { id: 'lc-mad-2', name: 'Raidurg', machines: 10, operators: 13, openJobs: 3, utilization: 96, status: 'Active' },
  { id: 'lc-mad-3', name: 'Kavuri Hills', machines: 8, operators: 11, openJobs: 3, utilization: 95, status: 'Active' },
  { id: 'lc-mad-4', name: 'Manikonda', machines: 8, operators: 11, openJobs: 2, utilization: 94, status: 'Active' },
  { id: 'lc-mad-5', name: 'Nanakramguda', machines: 7, operators: 9, openJobs: 2, utilization: 93, status: 'Active' },
  { id: 'lc-mad-6', name: 'Kondapur', machines: 5, operators: 6, openJobs: 2, utilization: 91, status: 'Active' },
]

export const operatorRows: OperatorRow[] = [
  { id: 'OP-101', name: 'Kiran Vardhan', locality: 'HITEC City', licence: 'Crane class II', rating: 4.9, jobs: 214, status: 'Verified', joined: '12 Mar 2025' },
  { id: 'OP-104', name: 'Sunita Devi', locality: 'Raidurg', licence: 'Concrete mixer', rating: 4.8, jobs: 148, status: 'Verified', joined: '08 Jun 2025' },
  { id: 'OP-121', name: 'Ravi Teja', locality: 'Kavuri Hills', licence: 'Excavator', rating: 4.7, jobs: 162, status: 'Verified', joined: '19 Apr 2025' },
  { id: 'OP-122', name: 'Fatima Zahra', locality: 'HITEC City', licence: 'Tower crane', rating: 4.8, jobs: 139, status: 'Verified', joined: '03 May 2025' },
  { id: 'OP-123', name: 'Bharat Reddy', locality: 'Manikonda', licence: 'Tipper HGV', rating: 4.6, jobs: 121, status: 'Verified', joined: '26 May 2025' },
  { id: 'OP-124', name: 'Lakshmi Prasad', locality: 'Nanakramguda', licence: 'Backhoe loader', rating: 4.5, jobs: 97, status: 'Verified', joined: '11 Jul 2025' },
  { id: 'OP-125', name: 'Arjun Deshmukh', locality: 'Kondapur', licence: 'Compactor', rating: 4.4, jobs: 66, status: 'Pending', joined: '24 Sep 2025' },
  { id: 'OP-126', name: 'Nazia Sultana', locality: 'Raidurg', licence: 'Excavator', rating: 4.6, jobs: 58, status: 'Pending', joined: '28 Sep 2025' },
  { id: 'OP-127', name: 'Prakash Raju', locality: 'Manikonda', licence: 'Crane class I', rating: 4.1, jobs: 47, status: 'Suspended', joined: '09 Feb 2025' },
  { id: 'OP-128', name: 'Vineet Sharma', locality: 'Kavuri Hills', licence: 'Concrete mixer', rating: 4.3, jobs: 35, status: 'Suspended', joined: '21 Mar 2025' },
]

export const bookingRows: BookingRow[] = [
  { id: 'BK-5185', customer: 'HCC Constructions', locality: 'HITEC City', machine: 'Tower Crane 6T', amount: '₹2,96,000', status: 'Confirmed', window: '22 Sep – 12 Oct' },
  { id: 'BK-5182', customer: 'L&T Metro Rail', locality: 'HITEC City', machine: 'CAT 320 Excavator', amount: '₹2,24,000', status: 'Active', window: '12 Sep – 26 Sep' },
  { id: 'BK-5180', customer: 'Phoenix Green Homes', locality: 'Raidurg', machine: 'Schwing Stetter Mixer', amount: '₹1,08,000', status: 'Active', window: '11 Sep – 25 Sep' },
  { id: 'BK-5177', customer: 'Cyberabad Development', locality: 'Nanakramguda', machine: 'CAT 320 Excavator', amount: '₹2,32,000', status: 'Active', window: '09 Sep – 27 Sep' },
  { id: 'BK-5175', customer: 'My Home Nexus', locality: 'Kavuri Hills', machine: 'Volvo FMX Tipper', amount: '₹1,44,000', status: 'Confirmed', window: '17 Sep – 30 Sep' },
  { id: 'BK-5170', customer: 'Divyasree Developers', locality: 'Manikonda', machine: 'ACE Hydra Crane 14T', amount: '₹2,68,000', status: 'Active', window: '05 Sep – 28 Sep' },
  { id: 'BK-5166', customer: 'Amara Infrastructure', locality: 'Kondapur', machine: 'JCB 3CX Backhoe', amount: '₹86,000', status: 'Completed', window: '02 Sep – 12 Sep' },
  { id: 'BK-5164', customer: 'Vascon Engineers', locality: 'Raidurg', machine: 'JCB 3CX Backhoe', amount: '₹92,000', status: 'Completed', window: '01 Sep – 11 Sep' },
  { id: 'BK-5162', customer: 'Cyberabad Builders', locality: 'Nanakramguda', machine: 'Motor Grader MG-180', amount: '₹1,12,000', status: 'Cancelled', window: '29 Aug – 08 Sep' },
  { id: 'BK-5158', customer: 'Sai Infra Projects', locality: 'Kondapur', machine: 'Compactor RM-800', amount: '₹72,000', status: 'Completed', window: '27 Aug – 06 Sep' },
  { id: 'BK-5154', customer: 'Aparna Constructions', locality: 'Kavuri Hills', machine: 'Tipper 10 Wheeler', amount: '₹94,000', status: 'Confirmed', window: '20 Sep – 02 Oct' },
  { id: 'BK-5140', customer: 'Deccan Roadlines', locality: 'HITEC City', machine: 'JCB 3CX', amount: '₹88,000', status: 'Completed', window: '25 Aug – 06 Sep' },
]

export const fleetRows: MachineRow[] = [
  { id: 'MC-3041', model: 'CAT 320 GC', regNo: 'TS-07-HB-4412', type: 'Excavator', locality: 'HITEC City', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 95, dailyRate: '₹6,900' },
  { id: 'MC-3042', model: 'Komatsu PC210', regNo: 'TS-07-PC-1198', type: 'Excavator', locality: 'Raidurg', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 94, dailyRate: '₹7,100' },
  { id: 'MC-3045', model: 'Tower Crane TC-9', regNo: 'TS-07-TC-4471', type: 'Crane', locality: 'HITEC City', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 96, dailyRate: '₹10,400' },
  { id: 'MC-3046', model: 'Schwing Stetter S6', regNo: 'TS-09-SW-2264', type: 'Concrete Mixer', locality: 'Raidurg', partner: 'Sri Krishna Equipment Rentals', status: 'Inspection', utilization: 71, dailyRate: '₹5,600' },
  { id: 'MC-3048', model: 'Volvo FMX 440', regNo: 'TS-07-VF-8830', type: 'Tipper', locality: 'Kondapur', partner: 'Deccan Heavy Machinery', status: 'Maintenance', utilization: 62, dailyRate: '₹7,300' },
  { id: 'MC-3049', model: 'Hydra Crane 14T', regNo: 'TS-07-HY-8814', type: 'Crane', locality: 'Kavuri Hills', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 93, dailyRate: '₹8,200' },
  { id: 'MC-3050', model: 'Bomag BW211', regNo: 'TS-07-BM-6612', type: 'Compactor', locality: 'Manikonda', partner: 'Twin Cities Liftways', status: 'Available', utilization: 79, dailyRate: '₹4,600' },
  { id: 'MC-3053', model: 'Putzmeister Pump', regNo: 'TS-07-PM-4408', type: 'Concrete Pump', locality: 'Nanakramguda', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 90, dailyRate: '₹8,800' },
  { id: 'MC-3056', model: 'ACE AG-15', regNo: 'TS-07-AC-7745', type: 'Crane', locality: 'Manikonda', partner: 'Charminar Plant Hire', status: 'Available', utilization: 84, dailyRate: '₹8,600' },
  { id: 'MC-3059', model: 'Tata Signa Tipper', regNo: 'TS-09-TS-3320', type: 'Tipper', locality: 'Kavuri Hills', partner: 'Deccan Heavy Machinery', status: 'Rented', utilization: 88, dailyRate: '₹5,400' },
  { id: 'MC-3062', model: 'Sany Crane SCC500', regNo: 'TS-09-SC-8876', type: 'Crane', locality: 'Kondapur', partner: 'Charminar Plant Hire', status: 'Inspection', utilization: 69, dailyRate: '₹10,200' },
  { id: 'MC-3064', model: 'JCB 3DX Eco', regNo: 'TS-07-JE-5526', type: 'Backhoe Loader', locality: 'HITEC City', partner: 'Deccan Heavy Machinery', status: 'Available', utilization: 82, dailyRate: '₹4,400' },
]

export const requestItems: RequestItem[] = [
  {
    id: 'MT-091',
    type: 'Maintenance',
    requester: 'Sri Krishna Equipment Rentals',
    locality: 'HITEC City',
    detail: 'Excavator hydraulic hose replacement before the next dispatch slot.',
    submitted: '2 hours ago',
    value: '₹12,800',
    status: 'Pending',
  },
  {
    id: 'MT-089',
    type: 'Maintenance',
    requester: 'Deccan Heavy Machinery',
    locality: 'Kondapur',
    detail: 'Tipper brake-pad replacement flagged during the weekly safety audit.',
    submitted: '6 hours ago',
    value: '₹9,400',
    status: 'Pending',
  },
  {
    id: 'IN-26',
    type: 'Incident',
    requester: 'Arjun Deshmukh',
    locality: 'Nanakramguda',
    detail: 'Dropped load marker on the service road; no injuries, site cleared.',
    submitted: '1 day ago',
    status: 'Pending',
  },
  {
    id: 'IN-25',
    type: 'Incident',
    requester: 'Sunita Devi',
    locality: 'Raidurg',
    detail: 'Mixer drum scratched during site entry; customer liability review closed.',
    submitted: '2 days ago',
    status: 'Approved',
  },
  {
    id: 'RF-39',
    type: 'Refund',
    requester: 'Vascon Engineers',
    locality: 'Raidurg',
    detail: 'Pro-rata refund after early handover of the backhoe loader.',
    submitted: '1 day ago',
    value: '₹14,200',
    status: 'Pending',
  },
  {
    id: 'RF-38',
    type: 'Refund',
    requester: 'Deccan Roadlines',
    locality: 'Manikonda',
    detail: 'Weekend surcharge reversal confirmed in the booking notes.',
    submitted: '3 days ago',
    value: '₹5,600',
    status: 'Approved',
  },
  {
    id: 'RC-31',
    type: 'Change Request',
    requester: 'Madhapur Dispatch Desk',
    locality: 'HITEC City',
    detail: 'Weekend dispatch window extended to 10 PM along the HITEC City corridor.',
    submitted: '2 days ago',
    status: 'Pending',
  },
  {
    id: 'RC-29',
    type: 'Change Request',
    requester: 'Raidurg Yard',
    locality: 'Raidurg',
    detail: 'Extend machine pickup counter hours to 9 PM on weekdays.',
    submitted: '5 days ago',
    status: 'Rejected',
  },
  {
    id: 'MT-084',
    type: 'Maintenance',
    requester: 'Charminar Plant Hire',
    locality: 'Raidurg',
    detail: 'Scheduled 500-hour service for the Hydra crane fleet.',
    submitted: '4 days ago',
    value: '₹36,000',
    status: 'Approved',
  },
]

export const zoneNotifications: ZoneNotification[] = [
  {
    id: 'zn-1',
    title: 'Incident report needs review',
    detail: 'IN-26 near Nanakramguda is waiting on your sign-off.',
    time: '1 day ago',
    tone: 'red',
    read: false,
    target: 'requests',
  },
  {
    id: 'zn-2',
    title: 'Maintenance quote pending',
    detail: 'MT-091 excavator hose replacement quoted at ₹12,800.',
    time: '2 hours ago',
    tone: 'blue',
    read: false,
    target: 'requests',
  },
  {
    id: 'zn-3',
    title: 'Two operator badges awaiting review',
    detail: 'Arjun Deshmukh and Nazia Sultana submitted renewal documents.',
    time: '6 hours ago',
    tone: 'amber',
    read: false,
    target: 'operators',
  },
  {
    id: 'zn-4',
    title: 'Zone holds rank 1 in Hyderabad',
    detail: 'Madhapur led all six city zones at 96% utilization again.',
    time: '1 day ago',
    tone: 'green',
    read: true,
    target: 'overview',
  },
  {
    id: 'zn-5',
    title: 'Machine moved to inspection',
    detail: 'MC-3046 mixer booked into the Raidurg yard workshop.',
    time: '3 days ago',
    tone: 'blue',
    read: true,
    target: 'fleet',
  },
]

export const zoneAlerts: ZoneAlert[] = [
  {
    id: 'za-1',
    title: 'Open incident past 24 hours',
    detail: 'IN-26 has been pending resolution since yesterday morning.',
    time: '2 hours ago',
    severity: 'Critical',
    target: 'requests',
  },
  {
    id: 'za-2',
    title: 'Machine overdue for service',
    detail: 'MC-3048 Volvo FMX missed its 250-hour service window in Kondapur.',
    time: '5 hours ago',
    severity: 'Warning',
    target: 'fleet',
  },
  {
    id: 'za-3',
    title: 'Above city utilization',
    detail: 'Zone utilization 96% vs Hyderabad average 93% this month.',
    time: '1 day ago',
    severity: 'Info',
    target: 'overview',
  },
]

export const activityFeed: ActivityItem[] = [
  { id: 'af-1', time: '12 min ago', actor: 'Dispatch Desk', action: 'assigned job', target: 'JOB-7741 at HITEC City' },
  { id: 'af-2', time: '35 min ago', actor: 'Sridhar Nair', action: 'approved maintenance', target: 'MT-084 · Charminar 500-hour service' },
  { id: 'af-3', time: '1 hour ago', actor: 'Praveen Kumar', action: 'published city digest', target: 'Weekly zone comparison' },
  { id: 'af-4', time: '3 hours ago', actor: 'Sri Krishna Equipment Rentals', action: 'flagged machine', target: 'MC-3046 for inspection' },
  { id: 'af-5', time: 'Yesterday', actor: 'Raidurg Yard', action: 'completed handover', target: 'BK-5164 · Vascon Engineers' },
  { id: 'af-6', time: 'Yesterday', actor: 'Sridhar Nair', action: 'filed change request', target: 'Weekend dispatch window' },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']

// Delegated approval limits for the Zone Admin (lower than City Admin).
// Anything above these limits is escalated to the City Admin.
export const zonePermissionLimits = {
  maintenanceApproval: '₹50,000 per request',
  refundApproval: '₹25,000 per request',
  changeRequests: 'Within zone operating policies only',
  escalationSLA: 'City Admin decides within 24 hours',
} as const

export const requestTypeMeta: Record<RequestType, { label: string; attention: string }> = {
  Maintenance: { label: 'Maintenance', attention: 'Maintenance' },
  Incident: { label: 'Incidents', attention: 'Incidents' },
  Refund: { label: 'Refunds', attention: 'Refunds' },
  'Change Request': { label: 'Change requests', attention: 'Change requests' },
}
