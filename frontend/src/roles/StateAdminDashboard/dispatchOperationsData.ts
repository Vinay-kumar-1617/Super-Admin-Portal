// State-scoped dispatch & operations seed data for the Telangana State Admin dashboard.
import { stateProfile } from './stateAdminData'

export type DispatchTab = 'jobs' | 'schedule' | 'dispatchers' | 'exceptions' | 'history'

export const dispatchTabs: Array<{ id: DispatchTab; label: string; hint: string }> = [
  { id: 'jobs', label: 'Dispatch jobs', hint: 'All dispatch jobs across the state' },
  { id: 'schedule', label: 'Schedules & deadlines', hint: 'Service schedules and SLA deadlines' },
  { id: 'dispatchers', label: 'Dispatcher workloads', hint: 'Workload and performance by dispatcher' },
  { id: 'exceptions', label: 'Exceptions & escalations', hint: 'Delayed, failed and escalated assignments' },
  { id: 'history', label: 'Job history', hint: 'Job history and assignment changes' },
]

export type DispatchJobStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed'
export type DispatchPriority = 'High' | 'Normal' | 'Low'
export type DispatchSla = 'On track' | 'Due soon' | 'Overdue'

export type DispatchHistoryEntry = {
  id: string
  action: string
  actor: string
  role: string
  time: string
  note?: string
}

export type DispatchJob = {
  id: string
  type: string
  customer: string
  city: string
  zone: string
  machineId: string
  machine: string
  dispatcherId: string | null
  dispatcher: string | null
  status: DispatchJobStatus
  priority: DispatchPriority
  scheduled: string
  deadline: string
  sla: DispatchSla
  createdAt: string
  history: DispatchHistoryEntry[]
}

export type Dispatcher = {
  id: string
  name: string
  city: string
  zone: string
  status: 'Available' | 'On break' | 'Offline'
  activeJobs: number
  capacity: number
  completedToday: number
  completedWeek: number
  avgResponseMins: number
  onTimeRate: number
  rating: number
}

export const dispatchers: Dispatcher[] = [
  { id: 'D-201', name: 'Gopal Rao', city: 'Hyderabad', zone: 'Madhapur', status: 'Available', activeJobs: 4, capacity: 6, completedToday: 5, completedWeek: 28, avgResponseMins: 18, onTimeRate: 96, rating: 4.8 },
  { id: 'D-202', name: 'Ravi Teja', city: 'Hyderabad', zone: 'Gachibowli', status: 'Available', activeJobs: 3, capacity: 6, completedToday: 4, completedWeek: 24, avgResponseMins: 21, onTimeRate: 94, rating: 4.7 },
  { id: 'D-203', name: 'Suresh Babu', city: 'Hyderabad', zone: 'Kukatpally', status: 'On break', activeJobs: 5, capacity: 6, completedToday: 3, completedWeek: 22, avgResponseMins: 27, onTimeRate: 89, rating: 4.5 },
  { id: 'D-204', name: 'Mahesh Kumar', city: 'Hyderabad', zone: 'Uppal', status: 'Available', activeJobs: 2, capacity: 5, completedToday: 4, completedWeek: 19, avgResponseMins: 24, onTimeRate: 91, rating: 4.6 },
  { id: 'D-205', name: 'Naveen Reddy', city: 'Warangal', zone: 'Hanamkonda', status: 'Available', activeJobs: 3, capacity: 5, completedToday: 3, completedWeek: 17, avgResponseMins: 26, onTimeRate: 93, rating: 4.7 },
  { id: 'D-206', name: 'Anand Rao', city: 'Karimnagar', zone: 'Chowrasta', status: 'Offline', activeJobs: 0, capacity: 4, completedToday: 0, completedWeek: 12, avgResponseMins: 32, onTimeRate: 88, rating: 4.4 },
  { id: 'D-207', name: 'Venkat Rao', city: 'Ramagundam', zone: 'Godavarikhani', status: 'Available', activeJobs: 2, capacity: 4, completedToday: 2, completedWeek: 14, avgResponseMins: 29, onTimeRate: 90, rating: 4.5 },
  { id: 'D-208', name: 'Praveen Kumar', city: 'Nalgonda', zone: 'Miryalaguda Road', status: 'Available', activeJobs: 1, capacity: 4, completedToday: 3, completedWeek: 16, avgResponseMins: 25, onTimeRate: 92, rating: 4.6 },
]

export const dispatchJobs: DispatchJob[] = [
  {
    id: 'DJ-7712', type: 'Machine delivery', customer: 'L&T Metro Rail', city: 'Hyderabad', zone: 'Madhapur', machineId: 'MC-3041', machine: 'CAT 320 GC', dispatcherId: 'D-201', dispatcher: 'Gopal Rao', status: 'In Progress', priority: 'High', scheduled: 'Today · 09:00', deadline: 'Today · 13:00', sla: 'Due soon', createdAt: '2 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Madhapur', role: 'Zone desk', time: '2 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '1 hour ago', note: 'Assigned to Gopal Rao (nearest available).' },
      { id: 'h3', action: 'Started', actor: 'Gopal Rao', role: 'Dispatcher', time: '40 min ago' },
    ],
  },
  {
    id: 'DJ-7710', type: 'On-site service', customer: 'MEIL', city: 'Hyderabad', zone: 'Gachibowli', machineId: 'MC-3034', machine: 'ACE AG-15', dispatcherId: 'D-202', dispatcher: 'Ravi Teja', status: 'Assigned', priority: 'Normal', scheduled: 'Today · 11:00', deadline: 'Today · 17:00', sla: 'On track', createdAt: '3 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Gachibowli', role: 'Zone desk', time: '3 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '2 hours ago' },
    ],
  },
  {
    id: 'DJ-7708', type: 'Machine pickup', customer: 'My Home Builders', city: 'Hyderabad', zone: 'Kukatpally', machineId: 'MC-3019', machine: 'Volvo FMX 440', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'High', scheduled: 'Today · 14:00', deadline: 'Today · 18:00', sla: 'Due soon', createdAt: '50 min ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Kukatpally', role: 'Zone desk', time: '50 min ago' },
      { id: 'h2', action: 'Escalated', actor: 'Zone Kukatpally', role: 'Zone desk', time: '30 min ago', note: 'No dispatcher accepted within 30 minutes.' },
    ],
  },
  {
    id: 'DJ-7705', type: 'On-site service', customer: 'Ramky Infrastructure', city: 'Hyderabad', zone: 'Uppal', machineId: 'MC-3031', machine: 'Schwing Stetter S4', dispatcherId: 'D-204', dispatcher: 'Mahesh Kumar', status: 'Completed', priority: 'Normal', scheduled: 'Today · 08:00', deadline: 'Today · 11:00', sla: 'On track', createdAt: '5 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Uppal', role: 'Zone desk', time: '5 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '4 hours ago' },
      { id: 'h3', action: 'Started', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '3 hours ago' },
      { id: 'h4', action: 'Completed', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '2 hours ago', note: 'Hydraulic pressure restored; machine returned to Available.' },
    ],
  },
  {
    id: 'DJ-7701', type: 'Machine delivery', customer: 'Vascon Engineers', city: 'Warangal', zone: 'Hanamkonda', machineId: 'MC-3027', machine: 'Tata Hitachi EX200', dispatcherId: 'D-205', dispatcher: 'Naveen Reddy', status: 'In Progress', priority: 'Normal', scheduled: 'Today · 10:30', deadline: 'Today · 15:00', sla: 'On track', createdAt: '4 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Warangal', role: 'Zone desk', time: '4 hours ago' },
      { id: 'h2', action: 'Assigned', actor: 'City Admin · Warangal', role: 'City Admin', time: '3 hours ago' },
      { id: 'h3', action: 'Started', actor: 'Naveen Reddy', role: 'Dispatcher', time: '1 hour ago' },
    ],
  },
  {
    id: 'DJ-7698', type: 'Emergency repair', customer: 'Singareni Collieries', city: 'Ramagundam', zone: 'Godavarikhani', machineId: 'MC-2994', machine: 'Hydraulic Crane 25T', dispatcherId: 'D-207', dispatcher: 'Venkat Rao', status: 'Assigned', priority: 'High', scheduled: 'Today · 12:00', deadline: 'Today · 16:00', sla: 'Due soon', createdAt: '2 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Ramagundam', role: 'Zone desk', time: '2 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '90 min ago' },
      { id: 'h3', action: 'Reassigned', actor: stateProfile.adminName, role: 'State Admin', time: '40 min ago', note: 'Moved from D-206 (offline) to D-207.' },
    ],
  },
  {
    id: 'DJ-7694', type: 'Machine pickup', customer: 'Nalgonda Cement Co', city: 'Nalgonda', zone: 'Miryalaguda Road', machineId: 'MC-2998', machine: 'Skid Steer S650', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'Low', scheduled: 'Tomorrow · 09:00', deadline: 'Tomorrow · 13:00', sla: 'On track', createdAt: '6 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Nalgonda', role: 'Zone desk', time: '6 hours ago' },
    ],
  },
  {
    id: 'DJ-7690', type: 'On-site service', customer: 'Greenko Energies', city: 'Khammam', zone: 'Wyra Road', machineId: 'MC-3005', machine: 'Tower Crane TC-6', dispatcherId: 'D-205', dispatcher: 'Naveen Reddy', status: 'Completed', priority: 'High', scheduled: 'Yesterday · 15:00', deadline: 'Yesterday · 19:00', sla: 'Overdue', createdAt: '1 day ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Khammam', role: 'Zone desk', time: '1 day ago' },
      { id: 'h2', action: 'Assigned', actor: 'City Admin · Warangal', role: 'City Admin', time: '1 day ago' },
      { id: 'h3', action: 'Delayed', actor: 'Naveen Reddy', role: 'Dispatcher', time: '22 hours ago', note: 'Site access blocked; delayed by 2 hours.' },
      { id: 'h4', action: 'Completed', actor: 'Naveen Reddy', role: 'Dispatcher', time: '20 hours ago', note: 'Completed outside SLA after access cleared.' },
    ],
  },
  {
    id: 'DJ-7686', type: 'Machine delivery', customer: 'Kakatiya Developers', city: 'Warangal', zone: 'Kazipet', machineId: 'MC-3012', machine: 'MG-180 Motor Grader', dispatcherId: 'D-206', dispatcher: 'Anand Rao', status: 'Pending', priority: 'Normal', scheduled: 'Tomorrow · 11:00', deadline: 'Tomorrow · 15:00', sla: 'On track', createdAt: '7 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Warangal', role: 'Zone desk', time: '7 hours ago' },
      { id: 'h2', action: 'Failed', actor: 'System', role: 'Scheduler', time: '5 hours ago', note: 'Assigned dispatcher D-206 went offline before accepting.' },
    ],
  },
  {
    id: 'DJ-7682', type: 'Emergency repair', customer: 'Deccan Roadlines', city: 'Hyderabad', zone: 'Begumpet', machineId: 'MC-3038', machine: 'JCB 3CX', dispatcherId: 'D-203', dispatcher: 'Suresh Babu', status: 'In Progress', priority: 'High', scheduled: 'Today · 07:30', deadline: 'Today · 10:30', sla: 'Overdue', createdAt: '6 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Begumpet', role: 'Zone desk', time: '6 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '5 hours ago' },
      { id: 'h3', action: 'Delayed', actor: 'Suresh Babu', role: 'Dispatcher', time: '3 hours ago', note: 'Spare part pickup held at depot.' },
    ],
  },
  {
    id: 'DJ-7678', type: 'Machine pickup', customer: 'Nizamabad Builders', city: 'Nizamabad', zone: 'Bodhan Road', machineId: 'MC-3016', machine: 'JCB 3DX', dispatcherId: 'D-208', dispatcher: 'Praveen Kumar', status: 'Completed', priority: 'Normal', scheduled: 'Today · 06:00', deadline: 'Today · 09:00', sla: 'On track', createdAt: '8 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Nizamabad', role: 'Zone desk', time: '8 hours ago' },
      { id: 'h2', action: 'Assigned', actor: 'City Admin · Nizamabad', role: 'City Admin', time: '7 hours ago' },
      { id: 'h3', action: 'Completed', actor: 'Praveen Kumar', role: 'Dispatcher', time: '5 hours ago' },
    ],
  },
  {
    id: 'DJ-7674', type: 'On-site service', customer: 'Suryapet Infra LLP', city: 'Suryapet', zone: 'Alair Road', machineId: 'MC-3009', machine: 'Compactor RM-800', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'Normal', scheduled: 'Tomorrow · 13:00', deadline: 'Tomorrow · 17:00', sla: 'On track', createdAt: '9 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Suryapet', role: 'Zone desk', time: '9 hours ago' },
    ],
  },
  {
    id: 'DJ-7670', type: 'Machine delivery', customer: 'Nagarjuna Constructions', city: 'Karimnagar', zone: 'Chowrasta', machineId: 'MC-3024', machine: 'Komatsu PC200', dispatcherId: 'D-206', dispatcher: 'Anand Rao', status: 'Assigned', priority: 'Normal', scheduled: 'Today · 13:30', deadline: 'Today · 18:00', sla: 'Due soon', createdAt: '5 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Karimnagar', role: 'Zone desk', time: '5 hours ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '4 hours ago' },
      { id: 'h3', action: 'Reassigned', actor: stateProfile.adminName, role: 'State Admin', time: '2 hours ago', note: 'Balanced load away from D-203 (on break).' },
    ],
  },
  {
    id: 'DJ-7666', type: 'Emergency repair', customer: 'TSIIC', city: 'Hyderabad', zone: 'Begumpet', machineId: 'MC-3058', machine: 'Putzmeister Pump', dispatcherId: 'D-204', dispatcher: 'Mahesh Kumar', status: 'Completed', priority: 'High', scheduled: 'Yesterday · 18:00', deadline: 'Yesterday · 22:00', sla: 'On track', createdAt: '1 day ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Begumpet', role: 'Zone desk', time: '1 day ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '1 day ago' },
      { id: 'h3', action: 'Completed', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '23 hours ago' },
    ],
  },
  {
    id: 'DJ-7662', type: 'Machine pickup', customer: 'Sanghi Industries', city: 'Hyderabad', zone: 'Uppal', machineId: 'MC-3047', machine: 'Bomag BW211', dispatcherId: 'D-201', dispatcher: 'Gopal Rao', status: 'Completed', priority: 'Low', scheduled: 'Yesterday · 14:00', deadline: 'Yesterday · 17:00', sla: 'On track', createdAt: '1 day ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Uppal', role: 'Zone desk', time: '1 day ago' },
      { id: 'h2', action: 'Assigned', actor: stateProfile.adminName, role: 'State Admin', time: '1 day ago' },
      { id: 'h3', action: 'Completed', actor: 'Gopal Rao', role: 'Dispatcher', time: '1 day ago' },
    ],
  },
  {
    id: 'DJ-7658', type: 'On-site service', customer: 'Twin Cities Builders', city: 'Hyderabad', zone: 'LB Nagar', machineId: 'MC-3052', machine: 'Tata Signa Tipper', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'High', scheduled: 'Today · 15:00', deadline: 'Today · 19:00', sla: 'Due soon', createdAt: '1 hour ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone LB Nagar', role: 'Zone desk', time: '1 hour ago' },
    ],
  },
]

export type DispatchExceptionKind = 'Delayed' | 'Failed' | 'Escalation'
export type DispatchExceptionSeverity = 'Critical' | 'Warning' | 'Info'
export type DispatchExceptionStatus = 'Open' | 'Acknowledged' | 'Resolved'

export type DispatchException = {
  id: string
  jobId: string
  kind: DispatchExceptionKind
  severity: DispatchExceptionSeverity
  detail: string
  raisedBy: string
  time: string
  status: DispatchExceptionStatus
  owner: string
}

export const dispatchExceptions: DispatchException[] = [
  { id: 'EX-318', jobId: 'DJ-7682', kind: 'Delayed', severity: 'Critical', detail: 'Emergency repair at Begumpet is running past SLA; spare part pickup held at depot.', raisedBy: 'Suresh Babu', time: '3 hours ago', status: 'Open', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-317', jobId: 'DJ-7708', kind: 'Escalation', severity: 'Critical', detail: 'High-priority pickup unassigned for over 30 minutes; no dispatcher accepted.', raisedBy: 'Zone Kukatpally', time: '30 min ago', status: 'Open', owner: 'State dispatch desk' },
  { id: 'EX-315', jobId: 'DJ-7686', kind: 'Failed', severity: 'Warning', detail: 'Auto-assignment failed because dispatcher D-206 went offline before accepting.', raisedBy: 'System', time: '5 hours ago', status: 'Acknowledged', owner: 'Karimnagar dispatch desk' },
  { id: 'EX-312', jobId: 'DJ-7690', kind: 'Delayed', severity: 'Warning', detail: 'Tower crane service at Wyra Road delayed by blocked site access.', raisedBy: 'Naveen Reddy', time: '22 hours ago', status: 'Resolved', owner: 'Khammam dispatch desk' },
  { id: 'EX-309', jobId: 'DJ-7666', kind: 'Escalation', severity: 'Info', detail: 'Customer escalated a missed ETA; resolved after dispatcher confirmation.', raisedBy: 'TSIIC', time: '23 hours ago', status: 'Resolved', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-305', jobId: 'DJ-7698', kind: 'Failed', severity: 'Warning', detail: 'First assignment to an offline dispatcher failed; job reassigned to D-207.', raisedBy: 'System', time: '40 min ago', status: 'Acknowledged', owner: 'Ramagundam dispatch desk' },
]
