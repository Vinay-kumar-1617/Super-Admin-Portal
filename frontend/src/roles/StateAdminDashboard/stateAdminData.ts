// State-scoped seed data for the Telangana State Admin dashboard.
import { emailForRole } from '../../auth/roleAccounts'

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type SectionId = 'overview' | 'cities' | 'zones' | 'locations' | 'bookings' | 'fleet' | 'approvals' | 'finance' | 'dispatch' | 'support' | 'reports' | 'users' | 'audit' | 'notifications' | 'rules'

export type StateKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export type CityRow = {
  id: string
  name: string
  code: string
  zones: number
  machines: number
  operators: number
  bookings: number
  utilization: number
  revenue: string
  status: 'Active' | 'Inactive'
  trend: string
}

export type ZoneRow = {
  id: string
  name: string
  city: string
  machines: number
  operators: number
  openJobs: number
  status: 'Active' | 'Review'
}

export type BookingStatus = 'Confirmed' | 'Active' | 'Completed' | 'Cancelled'

export type BookingRow = {
  id: string
  customerId: string
  customer: string
  city: string
  zone: string
  machine: string
  operatorId: string
  operatorName: string
  ownerId: string
  ownerName: string
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
  city: string
  zoneId?: string
  zoneName?: string
  partner: string
  status: MachineStatus
  utilization: number
  dailyRate: string
}

export type ApprovalType =
  | 'Application'
  | 'Property Verification'
  | 'City & Zone Admin'
  | 'Refund / Adjustment'
  | 'Account Activation'
  | 'Escalation'

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned'

export type ApprovalPriority = 'High' | 'Normal' | 'Low'

export type ApprovalDecision = 'Approved' | 'Rejected' | 'Returned'

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
  city: string
  detail: string
  submitted: string
  value?: string
  status: ApprovalStatus
  assignee: string
  priority: ApprovalPriority
  history: ApprovalHistoryEntry[]
}

export type StateApprovalLimit = {
  amount: number | null
  authority: string
}

// State-level approval limits for the Telangana State Admin. Anything above
// these limits, or any action affecting another state, is escalated to the
// Super Admin. New cities / zones and Super Admin accounts require Super Admin
// authority.
export const formatRupees = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`

export const stateApprovalLimits: Record<ApprovalType, StateApprovalLimit> = {
  Application: { amount: null, authority: 'State Admin' },
  'Property Verification': { amount: null, authority: 'State Admin' },
  'City & Zone Admin': { amount: null, authority: 'Super Admin' },
  'Refund / Adjustment': { amount: 500000, authority: 'State Admin' },
  'Account Activation': { amount: null, authority: 'State Admin' },
  Escalation: { amount: null, authority: 'State Admin' },
}

export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type StateNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: string
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info'

export type StateAlert = {
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

export const stateProfile = {
  name: 'Telangana',
  code: 'TS',
  capital: 'Hyderabad',
  adminName: 'Anitha Rao',
  adminEmail: emailForRole('state-admin'),
  adminInitials: 'AR',
}

export const stateKpis: StateKpi[] = [
  {
    label: 'State revenue',
    value: '₹8.71M',
    change: '+21.2%',
    tone: 'green',
    description: 'Gross rental revenue recorded across Telangana this month.',
    target: 'bookings',
  },
  {
    label: 'Active bookings',
    value: '2,518',
    change: '+14.6%',
    tone: 'blue',
    description: 'Booking requests handled by city and zone teams statewide.',
    target: 'bookings',
  },
  {
    label: 'Fleet utilization',
    value: '89%',
    change: '+5.1%',
    tone: 'purple',
    description: 'Share of on-hire machines across every active zone.',
    target: 'fleet',
  },
  {
    label: 'Active machines',
    value: '486',
    change: '+24',
    tone: 'orange',
    description: 'Machines live and rentable across the eight active districts.',
    target: 'fleet',
  },
]

export const monthlySeries: MonthlyPoint[] = [
  { month: 'Apr', revenue: 65, bookings: 1710, utilization: 76 },
  { month: 'May', revenue: 70, bookings: 1848, utilization: 79 },
  { month: 'Jun', revenue: 74, bookings: 2015, utilization: 81 },
  { month: 'Jul', revenue: 72, bookings: 1962, utilization: 83 },
  { month: 'Aug', revenue: 79, bookings: 2304, utilization: 86 },
  { month: 'Sep', revenue: 87, bookings: 2518, utilization: 89 },
]

export const cityRows: CityRow[] = [
  {
    id: 'cty-hyd',
    name: 'Hyderabad',
    code: 'HYD',
    zones: 6,
    machines: 212,
    operators: 298,
    bookings: 1286,
    utilization: 93,
    revenue: '₹4.62M',
    status: 'Active',
    trend: '+16%',
  },
  {
    id: 'cty-wgl',
    name: 'Warangal',
    code: 'WGL',
    zones: 2,
    machines: 58,
    operators: 84,
    bookings: 286,
    utilization: 88,
    revenue: '₹0.94M',
    status: 'Active',
    trend: '+10%',
  },
  {
    id: 'cty-krm',
    name: 'Karimnagar',
    code: 'KRM',
    zones: 1,
    machines: 50,
    operators: 70,
    bookings: 240,
    utilization: 85,
    revenue: '₹0.81M',
    status: 'Active',
    trend: '+8%',
  },
  {
    id: 'cty-nzb',
    name: 'Nizamabad',
    code: 'NZB',
    zones: 1,
    machines: 40,
    operators: 54,
    bookings: 178,
    utilization: 82,
    revenue: '₹0.62M',
    status: 'Active',
    trend: '+7%',
  },
  {
    id: 'cty-khm',
    name: 'Khammam',
    code: 'KHM',
    zones: 1,
    machines: 38,
    operators: 50,
    bookings: 164,
    utilization: 80,
    revenue: '₹0.56M',
    status: 'Active',
    trend: '+6%',
  },
  {
    id: 'cty-rmd',
    name: 'Ramagundam',
    code: 'RMD',
    zones: 1,
    machines: 34,
    operators: 44,
    bookings: 142,
    utilization: 78,
    revenue: '₹0.48M',
    status: 'Active',
    trend: '+5%',
  },
  {
    id: 'cty-srt',
    name: 'Suryapet',
    code: 'SRT',
    zones: 1,
    machines: 28,
    operators: 36,
    bookings: 118,
    utilization: 74,
    revenue: '₹0.36M',
    status: 'Active',
    trend: '+3%',
  },
  {
    id: 'cty-nlg',
    name: 'Nalgonda',
    code: 'NLG',
    zones: 1,
    machines: 26,
    operators: 34,
    bookings: 104,
    utilization: 72,
    revenue: '₹0.32M',
    status: 'Active',
    trend: '+2%',
  },
  {
    id: 'cty-spt',
    name: 'Siddipet',
    code: 'SPT',
    zones: 0,
    machines: 0,
    operators: 0,
    bookings: 0,
    utilization: 0,
    revenue: '₹0',
    status: 'Inactive',
    trend: '—',
  },
]

export const zoneRows: ZoneRow[] = [
  { id: 'zn-hyd-1', name: 'Madhapur', city: 'Hyderabad', machines: 52, operators: 68, openJobs: 16, status: 'Active' },
  { id: 'zn-hyd-2', name: 'Gachibowli', city: 'Hyderabad', machines: 48, operators: 62, openJobs: 14, status: 'Active' },
  { id: 'zn-hyd-3', name: 'Kukatpally', city: 'Hyderabad', machines: 44, operators: 56, openJobs: 12, status: 'Active' },
  { id: 'zn-hyd-4', name: 'Uppal', city: 'Hyderabad', machines: 32, operators: 44, openJobs: 9, status: 'Active' },
  { id: 'zn-hyd-5', name: 'Begumpet', city: 'Hyderabad', machines: 22, operators: 38, openJobs: 7, status: 'Active' },
  { id: 'zn-hyd-6', name: 'LB Nagar', city: 'Hyderabad', machines: 14, operators: 30, openJobs: 5, status: 'Review' },
  { id: 'zn-wgl-1', name: 'Hanamkonda', city: 'Warangal', machines: 32, operators: 44, openJobs: 7, status: 'Active' },
  { id: 'zn-wgl-2', name: 'Kazipet', city: 'Warangal', machines: 26, operators: 40, openJobs: 5, status: 'Active' },
  { id: 'zn-krm-1', name: 'Chowrasta', city: 'Karimnagar', machines: 50, operators: 70, openJobs: 8, status: 'Active' },
  { id: 'zn-nzb-1', name: 'Bodhan Road', city: 'Nizamabad', machines: 40, operators: 54, openJobs: 6, status: 'Active' },
  { id: 'zn-khm-1', name: 'Wyra Road', city: 'Khammam', machines: 38, operators: 50, openJobs: 5, status: 'Active' },
  { id: 'zn-rmd-1', name: 'Godavarikhani', city: 'Ramagundam', machines: 34, operators: 44, openJobs: 4, status: 'Review' },
  { id: 'zn-srt-1', name: 'Alair Road', city: 'Suryapet', machines: 28, operators: 36, openJobs: 3, status: 'Active' },
  { id: 'zn-nlg-1', name: 'Miryalaguda Road', city: 'Nalgonda', machines: 26, operators: 34, openJobs: 3, status: 'Review' },
]

export const bookingRows: BookingRow[] = [
  { id: 'BK-5182', customerId: 'CUST-4821', customer: 'L&T Metro Rail', city: 'Hyderabad', zone: 'Madhapur', machine: 'CAT 320 Excavator', operatorId: 'OPR-3390', operatorName: 'Gopal Rao', ownerId: 'OWN-2201', ownerName: 'Sri Krishna Equipment Rentals', amount: '₹2,24,000', status: 'Active', window: '12 Sep – 26 Sep' },
  { id: 'BK-5179', customerId: 'CUST-4822', customer: 'MEIL', city: 'Hyderabad', zone: 'Gachibowli', machine: 'ACE Hydra Crane 14T', operatorId: 'OPR-3391', operatorName: 'Ravi Teja', ownerId: 'OWN-2203', ownerName: 'Charminar Plant Hire', amount: '₹2,86,000', status: 'Active', window: '10 Sep – 30 Sep' },
  { id: 'BK-5176', customerId: 'CUST-4823', customer: 'My Home Builders', city: 'Hyderabad', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', operatorId: 'OPR-3392', operatorName: 'Suresh Babu', ownerId: 'OWN-2201', ownerName: 'Sri Krishna Equipment Rentals', amount: '₹1,12,000', status: 'Confirmed', window: '18 Sep – 30 Sep' },
  { id: 'BK-5173', customerId: 'CUST-4824', customer: 'Ramky Infrastructure', city: 'Hyderabad', zone: 'Uppal', machine: 'Volvo FMX Tipper', operatorId: 'OPR-3393', operatorName: 'Mahesh Kumar', ownerId: 'OWN-2202', ownerName: 'Deccan Heavy Machinery', amount: '₹1,56,000', status: 'Active', window: '08 Sep – 22 Sep' },
  { id: 'BK-5170', customerId: 'CUST-4825', customer: 'Vascon Engineers', city: 'Warangal', zone: 'Hanamkonda', machine: 'Tata Hitachi EX200', operatorId: 'OPR-3394', operatorName: 'Naveen Reddy', ownerId: 'OWN-2204', ownerName: 'Warangal Earthmovers', amount: '₹1,78,000', status: 'Confirmed', window: '20 Sep – 04 Oct' },
  { id: 'BK-5166', customerId: 'CUST-4826', customer: 'Nagarjuna Constructions', city: 'Karimnagar', zone: 'Chowrasta', machine: 'Komatsu PC200', operatorId: 'OPR-3395', operatorName: 'Anand Rao', ownerId: 'OWN-2205', ownerName: 'Nizam Rentals', amount: '₹1,94,000', status: 'Active', window: '05 Sep – 19 Sep' },
  { id: 'BK-5161', customerId: 'CUST-4827', customer: 'Singareni Collieries', city: 'Ramagundam', zone: 'Godavarikhani', machine: 'Tipper 10 Wheeler', operatorId: 'OPR-3396', operatorName: 'Venkat Rao', ownerId: 'OWN-2207', ownerName: 'Godavari Infra Rentals', amount: '₹96,000', status: 'Completed', window: '01 Sep – 11 Sep' },
  { id: 'BK-5158', customerId: 'CUST-4828', customer: 'Greenko Energies', city: 'Khammam', zone: 'Wyra Road', machine: 'Tower Crane 6T', operatorId: 'OPR-3397', operatorName: 'Rajesh Kumar', ownerId: 'OWN-2203', ownerName: 'Charminar Plant Hire', amount: '₹3,48,000', status: 'Confirmed', window: '22 Sep – 21 Oct' },
  { id: 'BK-5154', customerId: 'CUST-4829', customer: 'Kakatiya Developers', city: 'Warangal', zone: 'Kazipet', machine: 'JCB 3DX', operatorId: 'OPR-3398', operatorName: 'Srinivas Reddy', ownerId: 'OWN-2204', ownerName: 'Warangal Earthmovers', amount: '₹64,000', status: 'Completed', window: '28 Aug – 08 Sep' },
  { id: 'BK-5149', customerId: 'CUST-4830', customer: 'Suryapet Infra LLP', city: 'Suryapet', zone: 'Alair Road', machine: 'Compactor RM-800', operatorId: 'OPR-3399', operatorName: 'Praveen Kumar', ownerId: 'OWN-2206', ownerName: 'Twin Cities Liftways', amount: '₹72,000', status: 'Cancelled', window: '02 Sep – 09 Sep' },
  { id: 'BK-5145', customerId: 'CUST-4831', customer: 'Nizamabad Builders', city: 'Nizamabad', zone: 'Bodhan Road', machine: 'Motor Grader MG-180', operatorId: 'OPR-3400', operatorName: 'Karthik Rao', ownerId: 'OWN-2205', ownerName: 'Nizam Rentals', amount: '₹1,24,000', status: 'Active', window: '14 Sep – 26 Sep' },
  { id: 'BK-5140', customerId: 'CUST-4832', customer: 'Deccan Roadlines', city: 'Hyderabad', zone: 'Begumpet', machine: 'JCB 3CX Backhoe', operatorId: 'OPR-3390', operatorName: 'Gopal Rao', ownerId: 'OWN-2202', ownerName: 'Deccan Heavy Machinery', amount: '₹88,000', status: 'Completed', window: '25 Aug – 06 Sep' },
  { id: 'BK-5136', customerId: 'CUST-4833', customer: 'Nalgonda Cement Co', city: 'Nalgonda', zone: 'Miryalaguda Road', machine: 'Hydraulic Crane 25T', operatorId: 'OPR-3392', operatorName: 'Suresh Babu', ownerId: 'OWN-2207', ownerName: 'Godavari Infra Rentals', amount: '₹2,18,000', status: 'Confirmed', window: '19 Sep – 03 Oct' },
  { id: 'BK-5131', customerId: 'CUST-4834', customer: 'Twin Cities Builders', city: 'Hyderabad', zone: 'LB Nagar', machine: 'Skid Steer Loader', operatorId: 'OPR-3391', operatorName: 'Ravi Teja', ownerId: 'OWN-2206', ownerName: 'Twin Cities Liftways', amount: '₹74,000', status: 'Cancelled', window: '30 Aug – 06 Sep' },
]

export const fleetRows: MachineRow[] = [
  { id: 'MC-3041', model: 'CAT 320 GC', regNo: 'TS-07-HB-4412', type: 'Excavator', city: 'Hyderabad', zoneId: 'zn-hyd-1', zoneName: 'Madhapur', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 95, dailyRate: '₹6,900' },
  { id: 'MC-3038', model: 'JCB 3CX', regNo: 'TS-09-MM-2287', type: 'Backhoe Loader', city: 'Hyderabad', zoneId: 'zn-hyd-2', zoneName: 'Gachibowli', partner: 'Deccan Heavy Machinery', status: 'Available', utilization: 80, dailyRate: '₹4,300' },
  { id: 'MC-3034', model: 'ACE AG-15', regNo: 'TS-07-CW-9014', type: 'Crane', city: 'Hyderabad', zoneId: 'zn-hyd-3', zoneName: 'Kukatpally', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 92, dailyRate: '₹8,600' },
  { id: 'MC-3031', model: 'Schwing Stetter S4', regNo: 'TS-09-MX-7745', type: 'Concrete Mixer', city: 'Hyderabad', zoneId: 'zn-hyd-4', zoneName: 'Uppal', partner: 'Sri Krishna Equipment Rentals', status: 'Inspection', utilization: 68, dailyRate: '₹5,200' },
  { id: 'MC-3027', model: 'Tata Hitachi EX200', regNo: 'TS-16-EX-5521', type: 'Excavator', city: 'Warangal', zoneId: 'zn-wgl-1', zoneName: 'Hanamkonda', partner: 'Warangal Earthmovers', status: 'Rented', utilization: 90, dailyRate: '₹6,600' },
  { id: 'MC-3024', model: 'Komatsu PC200', regNo: 'TS-15-PC-3390', type: 'Excavator', city: 'Karimnagar', zoneId: 'zn-krm-1', zoneName: 'Chowrasta', partner: 'Nizam Rentals', status: 'Rented', utilization: 88, dailyRate: '₹7,000' },
  { id: 'MC-3019', model: 'Volvo FMX 440', regNo: 'TS-07-TK-1178', type: 'Tipper', city: 'Hyderabad', zoneId: 'zn-hyd-5', zoneName: 'Begumpet', partner: 'Deccan Heavy Machinery', status: 'Maintenance', utilization: 60, dailyRate: '₹7,300' },
  { id: 'MC-3016', model: 'JCB 3DX', regNo: 'TS-11-JB-6602', type: 'Backhoe Loader', city: 'Nizamabad', zoneId: 'zn-nzb-1', zoneName: 'Bodhan Road', partner: 'Nizam Rentals', status: 'Available', utilization: 76, dailyRate: '₹4,200' },
  { id: 'MC-3012', model: 'MG-180 Motor Grader', regNo: 'TS-16-GR-4478', type: 'Motor Grader', city: 'Warangal', zoneId: 'zn-wgl-2', zoneName: 'Kazipet', partner: 'Warangal Earthmovers', status: 'Available', utilization: 73, dailyRate: '₹5,700' },
  { id: 'MC-3009', model: 'Compactor RM-800', regNo: 'TS-27-RM-2214', type: 'Compactor', city: 'Suryapet', zoneId: 'zn-srt-1', zoneName: 'Alair Road', partner: 'Twin Cities Liftways', status: 'Inspection', utilization: 64, dailyRate: '₹4,000' },
  { id: 'MC-3005', model: 'Tower Crane TC-6', regNo: 'TS-07-TC-8853', type: 'Crane', city: 'Hyderabad', zoneId: 'zn-hyd-6', zoneName: 'LB Nagar', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 97, dailyRate: '₹9,800' },
  { id: 'MC-3002', model: 'Tipper 10W', regNo: 'TS-13-TT-5590', type: 'Tipper', city: 'Khammam', zoneId: 'zn-khm-1', zoneName: 'Wyra Road', partner: 'Godavari Infra Rentals', status: 'Available', utilization: 71, dailyRate: '₹4,900' },
  { id: 'MC-2998', model: 'Skid Steer S650', regNo: 'TS-23-SS-3341', type: 'Skid Steer Loader', city: 'Nalgonda', zoneId: 'zn-nlg-1', zoneName: 'Miryalaguda Road', partner: 'Twin Cities Liftways', status: 'Maintenance', utilization: 56, dailyRate: '₹4,500' },
  { id: 'MC-2994', model: 'Hydraulic Crane 25T', regNo: 'TS-26-HC-7726', type: 'Crane', city: 'Ramagundam', zoneId: 'zn-rmd-1', zoneName: 'Godavarikhani', partner: 'Godavari Infra Rentals', status: 'Rented', utilization: 89, dailyRate: '₹9,100' },
]

export const approvalRequests: ApprovalItem[] = [
  {
    id: 'AP-204',
    type: 'Application',
    requester: 'Srinivas Reddy',
    city: 'Hyderabad',
    detail: 'Partner onboarding application with identity documents and GST certificate.',
    submitted: '2 hours ago',
    status: 'Pending',
    assignee: 'Anitha Rao',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Srinivas Reddy', role: 'Partner applicant', time: '2 hours ago' },
    ],
  },
  {
    id: 'AP-203',
    type: 'Application',
    requester: 'Fatima Begum',
    city: 'Karimnagar',
    detail: 'Operator application for Karimnagar zone deployment with address proof.',
    submitted: '1 day ago',
    status: 'Pending',
    assignee: 'Ravi Chandran',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Fatima Begum', role: 'Operator applicant', time: '1 day ago' },
    ],
  },
  {
    id: 'PV-118',
    type: 'Property Verification',
    requester: 'Sri Krishna Equipment Rentals',
    city: 'Hyderabad',
    detail: 'Yard and machine ownership documents for six excavators awaiting site verification.',
    submitted: '3 hours ago',
    value: '6 machines',
    status: 'Pending',
    assignee: 'Anitha Rao',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Sri Krishna Equipment Rentals', role: 'Fleet partner', time: '3 hours ago' },
    ],
  },
  {
    id: 'PV-117',
    type: 'Property Verification',
    requester: 'Warangal Earthmovers',
    city: 'Warangal',
    detail: 'Title deed and insurance renewal for the Hanamkonda depot.',
    submitted: '2 days ago',
    status: 'Pending',
    assignee: 'City Admin · Warangal',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Warangal Earthmovers', role: 'Fleet partner', time: '2 days ago' },
      { id: 'h2', action: 'Returned', actor: 'Ravi Chandran', role: 'State Admin', time: '1 day ago', comment: 'Upload a clear copy of the title deed — the scanned pages are incomplete.' },
      { id: 'h3', action: 'Submitted', actor: 'Warangal Earthmovers', role: 'Fleet partner', time: '20 hours ago', comment: 'Uploaded the full 4-page title deed.' },
    ],
  },
  {
    id: 'CZ-31',
    type: 'City & Zone Admin',
    requester: 'Operations Desk',
    city: 'Siddipet',
    detail: 'Go-live request for Siddipet with two new zones and one partner fleet.',
    submitted: '5 hours ago',
    status: 'Pending',
    assignee: 'Anitha Rao',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Operations Desk', role: 'Operations', time: '5 hours ago' },
    ],
  },
  {
    id: 'CZ-30',
    type: 'City & Zone Admin',
    requester: 'Hyderabad City Admin',
    city: 'Hyderabad',
    detail: 'Rate card revision for tower crane day hire and a new Begumpet zone boundary.',
    submitted: '3 days ago',
    status: 'Pending',
    assignee: 'Anitha Rao',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Hyderabad City Admin', role: 'City Admin', time: '3 days ago' },
    ],
  },
  {
    id: 'RF-034',
    type: 'Refund / Adjustment',
    requester: 'Deccan Heavy Machinery',
    city: 'Hyderabad',
    detail: 'Weekend settlement adjustment for two short-closed excavator bookings.',
    submitted: '4 hours ago',
    value: '₹3,84,000',
    status: 'Pending',
    assignee: 'Finance Desk',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Deccan Heavy Machinery', role: 'Fleet partner', time: '4 hours ago' },
    ],
  },
  {
    id: 'RF-033',
    type: 'Refund / Adjustment',
    requester: 'Twin Cities Builders',
    city: 'Nalgonda',
    detail: 'Pro-rata refund on a booking cancelled inside the cooling-off window.',
    submitted: '1 day ago',
    value: '₹18,400',
    status: 'Pending',
    assignee: 'Finance Desk',
    priority: 'Low',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Twin Cities Builders', role: 'Customer', time: '1 day ago' },
    ],
  },
  {
    id: 'AC-77',
    type: 'Account Activation',
    requester: 'Naveen Reddy',
    city: 'Warangal',
    detail: 'Operator account reactivation after a 60-day voluntary suspension.',
    submitted: '6 hours ago',
    status: 'Pending',
    assignee: 'Support Desk',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Naveen Reddy', role: 'Operator', time: '6 hours ago' },
    ],
  },
  {
    id: 'AC-76',
    type: 'Account Activation',
    requester: 'Ramky Infrastructure',
    city: 'Hyderabad',
    detail: 'Customer account activation for a corporate bulk-booking workspace.',
    submitted: '2 days ago',
    status: 'Pending',
    assignee: 'Support Desk',
    priority: 'Low',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Ramky Infrastructure', role: 'Customer', time: '2 days ago' },
    ],
  },
  {
    id: 'ES-14',
    type: 'Escalation',
    requester: 'Nalgonda Cement Co',
    city: 'Nalgonda',
    detail: 'Escalated complaint: crane arrived 6 hours late and missed a slot payment deadline.',
    submitted: '8 hours ago',
    status: 'Pending',
    assignee: 'Anitha Rao',
    priority: 'High',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Nalgonda Cement Co', role: 'Customer', time: '8 hours ago' },
      { id: 'h2', action: 'Returned', actor: 'Support Desk', role: 'Support', time: '5 hours ago', comment: 'Unable to confirm the penalty waiver at desk level — escalate to State Admin.' },
    ],
  },
  {
    id: 'PV-116',
    type: 'Property Verification',
    requester: 'Charminar Plant Hire',
    city: 'Hyderabad',
    detail: 'Machine ownership verified and property record approved for insurance.',
    submitted: '3 days ago',
    status: 'Approved',
    assignee: 'Ravi Chandran',
    priority: 'Normal',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Charminar Plant Hire', role: 'Fleet partner', time: '3 days ago' },
      { id: 'h2', action: 'Approved', actor: 'Ravi Chandran', role: 'State Admin', time: '2 days ago', comment: 'All machine documents match the registry. Approved.' },
    ],
  },
  {
    id: 'RF-032',
    type: 'Refund / Adjustment',
    requester: 'Kakatiya Developers',
    city: 'Warangal',
    detail: 'Duplicate charge on the September rental invoice.',
    submitted: '5 days ago',
    value: '₹7,200',
    status: 'Rejected',
    assignee: 'Finance Desk',
    priority: 'Low',
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Kakatiya Developers', role: 'Customer', time: '5 days ago' },
      { id: 'h2', action: 'Rejected', actor: 'Finance Desk', role: 'Finance', time: '4 days ago', comment: 'Invoice reconciliation shows no duplicate charge.' },
    ],
  },
]

export const stateNotifications: StateNotification[] = [
  {
    id: 'sn-1',
    title: 'Application awaiting review',
    detail: 'Srinivas Reddy submitted partner documents for Hyderabad onboarding.',
    time: '2 hours ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
  },
  {
    id: 'sn-2',
    title: 'Refund / adjustment pending',
    detail: 'Deccan Heavy Machinery requested a ₹3,84,000 settlement adjustment.',
    time: '5 hours ago',
    tone: 'blue',
    read: false,
    target: 'approvals',
  },
  {
    id: 'sn-3',
    title: 'Zone moved to review',
    detail: 'Miryalaguda Road in Nalgonda slipped below 70% operator coverage.',
    time: '8 hours ago',
    tone: 'red',
    read: false,
    target: 'zones',
  },
  {
    id: 'sn-4',
    title: 'Utilization record',
    detail: 'Hyderabad crossed 93% fleet utilization for the third week running.',
    time: '1 day ago',
    tone: 'green',
    read: true,
    target: 'cities',
  },
  {
    id: 'sn-5',
    title: 'Siddipet go-live filed',
    detail: 'Operations desk raised a city & zone admin request for the ninth district.',
    time: '3 days ago',
    tone: 'blue',
    read: true,
    target: 'approvals',
  },
]

export const stateAlerts: StateAlert[] = [
  {
    id: 'sa-1',
    title: 'Two machines overdue for inspection',
    detail: 'MC-3031 and MC-3009 crossed their inspection window in Hyderabad and Suryapet.',
    time: '1 hour ago',
    severity: 'Warning',
    target: 'fleet',
  },
  {
    id: 'sa-2',
    title: 'Payout account change flagged',
    detail: 'A partner updated bank details minutes before a settlement release.',
    time: '6 hours ago',
    severity: 'Critical',
    target: 'approvals',
  },
  {
    id: 'sa-3',
    title: 'Dispatch SLA holding',
    detail: 'Average dispatch time at 38 minutes across all active zones.',
    time: '1 day ago',
    severity: 'Info',
    target: 'zones',
  },
]

export const activityFeed: ActivityItem[] = [
  { id: 'af-1', time: '18 min ago', actor: 'Hyderabad City Admin', action: 'approved operator badge', target: 'Kiran Vardhan' },
  { id: 'af-2', time: '1 hour ago', actor: 'Zone Warangal', action: 'assigned job', target: 'JOB-9841 at Hanamkonda' },
  { id: 'af-3', time: '3 hours ago', actor: 'Finance Desk', action: 'released payout', target: 'PO-403 · ₹2,14,000' },
  { id: 'af-4', time: '5 hours ago', actor: 'Karimnagar City Admin', action: 'flagged machine for service', target: 'MC-3009 Compactor' },
  { id: 'af-5', time: 'Yesterday', actor: 'Operations Desk', action: 'published rate card', target: 'Hyderabad crane hire' },
  { id: 'af-6', time: 'Yesterday', actor: 'Anitha Rao', action: 'enabled city report', target: 'Weekly utilization digest' },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']

export const approvalTypeMeta: Record<ApprovalType, { label: string; attention: string }> = {
  Application: { label: 'Applications', attention: 'Application approvals' },
  'Property Verification': { label: 'Property verification', attention: 'Property verification' },
  'City & Zone Admin': { label: 'City & zone admin', attention: 'City & zone requests' },
  'Refund / Adjustment': { label: 'Refunds & adjustments', attention: 'Refund / adjustments' },
  'Account Activation': { label: 'Account activation', attention: 'Account activations' },
  Escalation: { label: 'Escalations & exceptions', attention: 'Escalated exceptions' },
}
