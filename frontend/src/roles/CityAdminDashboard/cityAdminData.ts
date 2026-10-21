// City-scoped seed data for the Hyderabad City Admin dashboard.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId = 'overview' | 'zones' | 'operators' | 'bookings' | 'fleet' | 'dispatch' | 'approvals' | 'finance' | 'support' | 'reports' | 'users' | 'audit' | 'notifications' | 'rules'

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type CityKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export type ZoneRow = {
  id: string
  name: string
  area: string
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
  zone: string
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
  zone: string
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
  zone: string
  partner: string
  status: MachineStatus
  utilization: number
  dailyRate: string
}

export type ApprovalType = 'Application' | 'Property Verification' | 'Operational Request' | 'Refund / Adjustment'
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Escalated'
export type ApprovalPriority = 'High' | 'Normal' | 'Low'
export type ApprovalDecision = 'Approved' | 'Rejected' | 'Returned' | 'Escalated'

export type ApprovalHistoryEntry = {
  id: string
  action: ApprovalDecision | 'Submitted'
  actor: string
  role: string
  time: string
  comment?: string
}

export type ApprovalItem = {
  id: string
  type: ApprovalType
  requester: string
  zone: string
  detail: string
  submitted: string
  value?: string
  amount?: number
  status: ApprovalStatus
  assignee: string
  priority: ApprovalPriority
  history: ApprovalHistoryEntry[]
}

export type ApprovalLimit = {
  amount: number | null
  authority: string
}

export const cityApprovalLimits: Record<ApprovalType, ApprovalLimit> = {
  Application: { amount: null, authority: 'State Admin' },
  'Property Verification': { amount: null, authority: 'State Admin' },
  'Operational Request': { amount: 50000, authority: 'State Admin' },
  'Refund / Adjustment': { amount: 25000, authority: 'State Admin' },
}

export const formatRupees = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`

export const exceedsApprovalLimit = (item: ApprovalItem): boolean => {
  const limit = cityApprovalLimits[item.type].amount
  return limit !== null && item.amount !== undefined && item.amount > limit
}

export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type CityNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: string
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info'

export type CityAlert = {
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

export const cityProfile = {
  state: 'Telangana',
  name: 'Hyderabad',
  code: 'HYD',
  adminName: 'Praveen Kumar',
  adminEmail: emailForRole('city-admin'),
  adminInitials: 'PK',
}

export const cityKpis: CityKpi[] = [
  {
    label: 'City revenue',
    value: '₹4.62M',
    change: '+19.8%',
    tone: 'green',
    description: 'Gross rental revenue recorded across Hyderabad this month.',
    target: 'bookings',
  },
  {
    label: 'Active bookings',
    value: '1,286',
    change: '+15.4%',
    tone: 'blue',
    description: 'Booking requests handled across the six city zones.',
    target: 'bookings',
  },
  {
    label: 'Fleet utilization',
    value: '93%',
    change: '+5.6%',
    tone: 'purple',
    description: 'Share of on-hire machines across every Hyderabad zone.',
    target: 'fleet',
  },
  {
    label: 'Active operators',
    value: '298',
    change: '+18',
    tone: 'orange',
    description: 'Badge-cleared operators available for dispatch this month.',
    target: 'operators',
  },
]

export const monthlySeries: MonthlyPoint[] = [
  { month: 'Apr', revenue: 29, bookings: 712, utilization: 78 },
  { month: 'May', revenue: 32, bookings: 784, utilization: 81 },
  { month: 'Jun', revenue: 34, bookings: 861, utilization: 84 },
  { month: 'Jul', revenue: 35, bookings: 848, utilization: 86 },
  { month: 'Aug', revenue: 41, bookings: 1042, utilization: 90 },
  { month: 'Sep', revenue: 46, bookings: 1286, utilization: 93 },
]

export const zoneRows: ZoneRow[] = [
  { id: 'zn-hyd-1', name: 'Madhapur', area: 'HITEC City corridor', machines: 52, operators: 68, openJobs: 16, utilization: 96, status: 'Active' },
  { id: 'zn-hyd-2', name: 'Gachibowli', area: 'Financial district', machines: 48, operators: 62, openJobs: 14, utilization: 95, status: 'Active' },
  { id: 'zn-hyd-3', name: 'Kukatpally', area: 'NH-44 industrial belt', machines: 44, operators: 56, openJobs: 12, utilization: 92, status: 'Active' },
  { id: 'zn-hyd-4', name: 'Uppal', area: 'Eastern corridor', machines: 32, operators: 44, openJobs: 9, utilization: 90, status: 'Active' },
  { id: 'zn-hyd-5', name: 'Begumpet', area: 'Central Hyderabad', machines: 22, operators: 38, openJobs: 7, utilization: 88, status: 'Active' },
  { id: 'zn-hyd-6', name: 'LB Nagar', area: 'Southern ring', machines: 14, operators: 30, openJobs: 5, utilization: 84, status: 'Review' },
]

export const operatorRows: OperatorRow[] = [
  { id: 'OP-101', name: 'Kiran Vardhan', zone: 'Madhapur', licence: 'Crane class II', rating: 4.9, jobs: 214, status: 'Verified', joined: '12 Mar 2025' },
  { id: 'OP-102', name: 'Sandeep Yadav', zone: 'Gachibowli', licence: 'Excavator', rating: 4.8, jobs: 186, status: 'Verified', joined: '04 Apr 2025' },
  { id: 'OP-103', name: 'Rakesh Naidu', zone: 'Kukatpally', licence: 'Tipper HGV', rating: 4.7, jobs: 172, status: 'Verified', joined: '21 May 2025' },
  { id: 'OP-104', name: 'Sunita Devi', zone: 'Madhapur', licence: 'Concrete mixer', rating: 4.8, jobs: 148, status: 'Verified', joined: '08 Jun 2025' },
  { id: 'OP-105', name: 'Imran Ali', zone: 'Uppal', licence: 'Backhoe loader', rating: 4.6, jobs: 132, status: 'Verified', joined: '17 Jul 2025' },
  { id: 'OP-106', name: 'Venkat Rao', zone: 'Begumpet', licence: 'Crane class I', rating: 4.9, jobs: 128, status: 'Verified', joined: '29 Jul 2025' },
  { id: 'OP-107', name: 'Ayesha Siddiqui', zone: 'Gachibowli', licence: 'Excavator', rating: 4.7, jobs: 96, status: 'Verified', joined: '14 Aug 2025' },
  { id: 'OP-108', name: 'Mahesh Goud', zone: 'LB Nagar', licence: 'Compactor', rating: 4.5, jobs: 74, status: 'Verified', joined: '02 Sep 2025' },
  { id: 'OP-109', name: 'Praveen Rathod', zone: 'Kukatpally', licence: 'Tower crane', rating: 4.6, jobs: 62, status: 'Pending', joined: '22 Sep 2025' },
  { id: 'OP-110', name: 'Jyothi Lakshmi', zone: 'Uppal', licence: 'Backhoe loader', rating: 4.4, jobs: 54, status: 'Pending', joined: '26 Sep 2025' },
  { id: 'OP-111', name: 'Suresh Babu', zone: 'LB Nagar', licence: 'Tipper HGV', rating: 4.2, jobs: 41, status: 'Suspended', joined: '11 Feb 2025' },
  { id: 'OP-112', name: 'Noor Fatima', zone: 'Begumpet', licence: 'Concrete mixer', rating: 4.5, jobs: 38, status: 'Suspended', joined: '30 Mar 2025' },
]

export const bookingRows: BookingRow[] = [
  { id: 'BK-5182', customer: 'L&T Metro Rail', zone: 'Madhapur', machine: 'CAT 320 Excavator', amount: '₹2,24,000', status: 'Active', window: '12 Sep – 26 Sep' },
  { id: 'BK-5179', customer: 'MEIL', zone: 'Gachibowli', machine: 'ACE Hydra Crane 14T', amount: '₹2,86,000', status: 'Active', window: '10 Sep – 30 Sep' },
  { id: 'BK-5176', customer: 'My Home Builders', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', amount: '₹1,12,000', status: 'Confirmed', window: '18 Sep – 30 Sep' },
  { id: 'BK-5173', customer: 'Ramky Infrastructure', zone: 'Uppal', machine: 'Volvo FMX Tipper', amount: '₹1,56,000', status: 'Active', window: '08 Sep – 22 Sep' },
  { id: 'BK-5171', customer: 'Sobha Realty', zone: 'Gachibowli', machine: 'Tower Crane 6T', amount: '₹3,24,000', status: 'Confirmed', window: '20 Sep – 20 Oct' },
  { id: 'BK-5168', customer: 'TSIIC', zone: 'Begumpet', machine: 'Motor Grader MG-180', amount: '₹1,18,000', status: 'Active', window: '15 Sep – 27 Sep' },
  { id: 'BK-5164', customer: 'Vascon Engineers', zone: 'Madhapur', machine: 'JCB 3CX Backhoe', amount: '₹92,000', status: 'Completed', window: '01 Sep – 11 Sep' },
  { id: 'BK-5160', customer: 'Emaar India', zone: 'Gachibowli', machine: 'CAT 320 Excavator', amount: '₹2,48,000', status: 'Active', window: '06 Sep – 24 Sep' },
  { id: 'BK-5156', customer: 'Auroville Structures', zone: 'LB Nagar', machine: 'Compactor RM-800', amount: '₹76,000', status: 'Completed', window: '28 Aug – 08 Sep' },
  { id: 'BK-5152', customer: 'Kences Builders', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', amount: '₹1,04,000', status: 'Confirmed', window: '19 Sep – 01 Oct' },
  { id: 'BK-5148', customer: 'Sanghi Industries', zone: 'Uppal', machine: 'Tipper 10 Wheeler', amount: '₹98,000', status: 'Completed', window: '25 Aug – 06 Sep' },
  { id: 'BK-5144', customer: 'Smartworks Infra', zone: 'Begumpet', machine: 'Skid Steer Loader', amount: '₹82,000', status: 'Cancelled', window: '30 Aug – 06 Sep' },
  { id: 'BK-5140', customer: 'Deccan Roadlines', zone: 'Madhapur', machine: 'JCB 3CX', amount: '₹88,000', status: 'Completed', window: '25 Aug – 06 Sep' },
  { id: 'BK-5131', customer: 'Twin Cities Builders', zone: 'LB Nagar', machine: 'Skid Steer Loader', amount: '₹74,000', status: 'Cancelled', window: '30 Aug – 06 Sep' },
]

export const fleetRows: MachineRow[] = [
  { id: 'MC-3041', model: 'CAT 320 GC', regNo: 'TS-07-HB-4412', type: 'Excavator', zone: 'Madhapur', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 95, dailyRate: '₹6,900' },
  { id: 'MC-3038', model: 'JCB 3CX', regNo: 'TS-09-MM-2287', type: 'Backhoe Loader', zone: 'Gachibowli', partner: 'Deccan Heavy Machinery', status: 'Available', utilization: 80, dailyRate: '₹4,300' },
  { id: 'MC-3034', model: 'ACE AG-15', regNo: 'TS-07-CW-9014', type: 'Crane', zone: 'Kukatpally', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 92, dailyRate: '₹8,600' },
  { id: 'MC-3031', model: 'Schwing Stetter S4', regNo: 'TS-09-MX-7745', type: 'Concrete Mixer', zone: 'Begumpet', partner: 'Sri Krishna Equipment Rentals', status: 'Inspection', utilization: 68, dailyRate: '₹5,200' },
  { id: 'MC-3019', model: 'Volvo FMX 440', regNo: 'TS-07-TK-1178', type: 'Tipper', zone: 'Uppal', partner: 'Deccan Heavy Machinery', status: 'Maintenance', utilization: 60, dailyRate: '₹7,300' },
  { id: 'MC-3005', model: 'Tower Crane TC-6', regNo: 'TS-07-TC-8853', type: 'Crane', zone: 'Gachibowli', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 97, dailyRate: '₹9,800' },
  { id: 'MC-3044', model: 'Komatsu PC210', regNo: 'TS-09-PC-6631', type: 'Excavator', zone: 'Kukatpally', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 91, dailyRate: '₹7,100' },
  { id: 'MC-3047', model: 'Bomag BW211', regNo: 'TS-07-BM-3352', type: 'Compactor', zone: 'Uppal', partner: 'Twin Cities Liftways', status: 'Available', utilization: 77, dailyRate: '₹4,600' },
  { id: 'MC-3049', model: 'Hydra Crane 14T', regNo: 'TS-07-HY-8814', type: 'Crane', zone: 'Madhapur', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 93, dailyRate: '₹8,200' },
  { id: 'MC-3052', model: 'Tata Signa Tipper', regNo: 'TS-09-SG-4471', type: 'Tipper', zone: 'LB Nagar', partner: 'Twin Cities Liftways', status: 'Available', utilization: 72, dailyRate: '₹5,400' },
  { id: 'MC-3055', model: 'XCMG Excavator 215', regNo: 'TS-07-XC-9927', type: 'Excavator', zone: 'Begumpet', partner: 'Deccan Heavy Machinery', status: 'Inspection', utilization: 66, dailyRate: '₹6,700' },
  { id: 'MC-3058', model: 'Putzmeister Pump', regNo: 'TS-07-PM-1163', type: 'Concrete Pump', zone: 'Gachibowli', partner: 'Sri Krishna Equipment Rentals', status: 'Maintenance', utilization: 58, dailyRate: '₹8,800' },
  { id: 'MC-3061', model: 'Sany Crane SCC500', regNo: 'TS-09-SC-7749', type: 'Crane', zone: 'Kukatpally', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 94, dailyRate: '₹10,200' },
  { id: 'MC-3064', model: 'JCB 3DX Eco', regNo: 'TS-07-JE-5526', type: 'Backhoe Loader', zone: 'Madhapur', partner: 'Deccan Heavy Machinery', status: 'Available', utilization: 82, dailyRate: '₹4,400' },
]

export const approvalRequests: ApprovalItem[] = [
  {
    id: 'AP-412',
    type: 'Application',
    requester: 'Praveen Rathod',
    zone: 'Kukatpally',
    detail: 'Tower crane licence and medical fitness record submitted for badge issue.',
    submitted: '1 hour ago',
    value: 'Tower crane licence',
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Praveen Rathod', role: 'Operator applicant', time: '1 hour ago' }],
  },
  {
    id: 'AP-411',
    type: 'Application',
    requester: 'Jyothi Lakshmi',
    zone: 'Uppal',
    detail: 'Backhoe operator badge renewal with updated insurance attachment.',
    submitted: '3 hours ago',
    value: 'Badge renewal',
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Jyothi Lakshmi', role: 'Operator applicant', time: '3 hours ago' }],
  },
  {
    id: 'PV-118',
    type: 'Property Verification',
    requester: 'Sri Krishna Equipment Rentals',
    zone: 'Gachibowli',
    detail: 'Yard and machine ownership documents for six excavators awaiting site verification.',
    submitted: '3 hours ago',
    value: '6 machines',
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'High',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Sri Krishna Equipment Rentals', role: 'Fleet partner', time: '3 hours ago' }],
  },
  {
    id: 'OR-087',
    type: 'Operational Request',
    requester: 'Deccan Heavy Machinery',
    zone: 'Uppal',
    detail: 'Volvo FMX tipper engine overhaul quoted before it returns to the fleet.',
    submitted: '5 hours ago',
    value: '₹48,000',
    amount: 48000,
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Deccan Heavy Machinery', role: 'Fleet partner', time: '5 hours ago' }],
  },
  {
    id: 'OR-086',
    type: 'Operational Request',
    requester: 'Charminar Plant Hire',
    zone: 'Madhapur',
    detail: 'Full crane fleet 500-hour service package quoted above the city operational cap.',
    submitted: '6 hours ago',
    value: '₹62,000',
    amount: 62000,
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'High',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Charminar Plant Hire', role: 'Fleet partner', time: '6 hours ago' }],
  },
  {
    id: 'RF-034',
    type: 'Refund / Adjustment',
    requester: 'Twin Cities Builders',
    zone: 'LB Nagar',
    detail: 'Pro-rata refund for a booking cancelled within the cooling-off window.',
    submitted: '1 day ago',
    value: '₹18,400',
    amount: 18400,
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Twin Cities Builders', role: 'Customer', time: '1 day ago' }],
  },
  {
    id: 'RF-035',
    type: 'Refund / Adjustment',
    requester: 'Smartworks Infra',
    zone: 'Begumpet',
    detail: 'Damage waiver claim after inspection cleared the machine, above the city refund limit.',
    submitted: '2 days ago',
    value: '₹40,000',
    amount: 40000,
    status: 'Pending',
    assignee: 'Praveen Kumar',
    priority: 'High',
    history: [{ id: 'h1', action: 'Submitted', actor: 'Smartworks Infra', role: 'Customer', time: '2 days ago' }],
  },
  {
    id: 'OR-084',
    type: 'Operational Request',
    requester: 'Charminar Plant Hire',
    zone: 'Madhapur',
    detail: 'Scheduled 500-hour service for the Hydra crane fleet.',
    submitted: '4 days ago',
    value: '₹36,000',
    amount: 36000,
    status: 'Approved',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Charminar Plant Hire', role: 'Fleet partner', time: '4 days ago' },
      { id: 'h2', action: 'Approved', actor: 'Praveen Kumar', role: 'City Admin', time: '3 days ago', comment: 'Within city operational cap. Approved.' },
    ],
  },
  {
    id: 'PV-117',
    type: 'Property Verification',
    requester: 'TSIIC',
    zone: 'Begumpet',
    detail: 'Title deed and insurance renewal for the Begumpet equipment depot.',
    submitted: '3 days ago',
    value: '1 depot',
    status: 'Returned',
    assignee: 'Praveen Kumar',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'TSIIC', role: 'Fleet partner', time: '3 days ago' },
      { id: 'h2', action: 'Returned', actor: 'Praveen Kumar', role: 'City Admin', time: '2 days ago', comment: 'Upload a clear copy of the title deed — the scanned pages are incomplete.' },
    ],
  },
  {
    id: 'RF-031',
    type: 'Refund / Adjustment',
    requester: 'Kences Builders',
    zone: 'Kukatpally',
    detail: 'Duplicate charge on the September rental invoice.',
    submitted: '5 days ago',
    value: '₹7,200',
    amount: 7200,
    status: 'Rejected',
    assignee: 'Praveen Kumar',
    priority: 'Low',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Kences Builders', role: 'Customer', time: '5 days ago' },
      { id: 'h2', action: 'Rejected', actor: 'Praveen Kumar', role: 'City Admin', time: '4 days ago', comment: 'Invoice 4482 was already credited — no duplicate charge found.' },
    ],
  },
  {
    id: 'RF-030',
    type: 'Refund / Adjustment',
    requester: 'Emaar India',
    zone: 'Gachibowli',
    detail: 'Contract termination settlement across multiple long-term rentals.',
    submitted: '6 days ago',
    value: '₹1,10,000',
    amount: 110000,
    status: 'Escalated',
    assignee: 'State Admin',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Emaar India', role: 'Customer', time: '6 days ago' },
      { id: 'h2', action: 'Escalated', actor: 'Praveen Kumar', role: 'City Admin', time: '5 days ago', comment: '₹1,10,000 exceeds the city refund limit — escalated to State Admin.' },
    ],
  },
]

export const cityNotifications: CityNotification[] = [
  {
    id: 'cn-1',
    title: 'Operator badge awaiting review',
    detail: 'Praveen Rathod submitted a tower crane licence for Kukatpally.',
    time: '1 hour ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
  },
  {
    id: 'cn-2',
    title: 'Maintenance quote pending',
    detail: 'Volvo FMX tipper engine overhaul quoted at ₹48,000 in Uppal.',
    time: '5 hours ago',
    tone: 'blue',
    read: false,
    target: 'approvals',
  },
  {
    id: 'cn-3',
    title: 'Zone moved to review',
    detail: 'LB Nagar slipped below 85% operator coverage this week.',
    time: '8 hours ago',
    tone: 'red',
    read: false,
    target: 'zones',
  },
  {
    id: 'cn-4',
    title: 'Utilization record',
    detail: 'Madhapur crossed 96% fleet utilization for the third week running.',
    time: '1 day ago',
    tone: 'green',
    read: true,
    target: 'zones',
  },
  {
    id: 'cn-5',
    title: 'Two operators suspended',
    detail: 'Badge suspension applied after repeated SLA misses.',
    time: '3 days ago',
    tone: 'blue',
    read: true,
    target: 'operators',
  },
]

export const cityAlerts: CityAlert[] = [
  {
    id: 'ca-1',
    title: 'Two machines overdue for inspection',
    detail: 'MC-3031 and MC-3055 crossed their inspection window in Begumpet.',
    time: '1 hour ago',
    severity: 'Warning',
    target: 'fleet',
  },
  {
    id: 'ca-2',
    title: 'Refund burst detected',
    detail: 'Three refund requests filed from LB Nagar within six hours.',
    time: '4 hours ago',
    severity: 'Critical',
    target: 'approvals',
  },
  {
    id: 'ca-3',
    title: 'Dispatch SLA holding',
    detail: 'Average dispatch time at 31 minutes across all six zones.',
    time: '1 day ago',
    severity: 'Info',
    target: 'zones',
  },
]

export const activityFeed: ActivityItem[] = [
  { id: 'af-1', time: '12 min ago', actor: 'Zone Madhapur', action: 'assigned job', target: 'JOB-7712 at HITEC City' },
  { id: 'af-2', time: '40 min ago', actor: 'Praveen Kumar', action: 'verified operator badge', target: 'Kiran Vardhan' },
  { id: 'af-3', time: '2 hours ago', actor: 'Finance Desk', action: 'released payout', target: 'PO-403 · ₹2,14,000' },
  { id: 'af-4', time: '4 hours ago', actor: 'Zone Uppal', action: 'flagged machine for service', target: 'MC-3019 Volvo FMX' },
  { id: 'af-5', time: 'Yesterday', actor: 'Gachibowli Zone Lead', action: 'filed change request', target: 'Weekend dispatch window' },
  { id: 'af-6', time: 'Yesterday', actor: 'Praveen Kumar', action: 'published zone report', target: 'Weekly utilization digest' },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']

export const approvalTypeMeta: Record<ApprovalType, { label: string; attention: string }> = {
  Application: { label: 'Applications', attention: 'Applications' },
  'Property Verification': { label: 'Property verification', attention: 'Property verification' },
  'Operational Request': { label: 'Operational requests', attention: 'Operational requests' },
  'Refund / Adjustment': { label: 'Refunds & adjustments', attention: 'Refunds & adjustments' },
}
